from firebase_functions import https_fn, options
from firebase_admin import initialize_app, firestore
import base64
import time
import fitz  # PyMuPDF
import psutil
import os
import gc
from gemini_client import extract_data
from consolidation import flatten_items

# Import billing functions to expose them
from billing import create_checkout_session, create_portal_session, stripe_webhook

# Admin emails bypass subscription checks
ADMIN_EMAILS = ['josh@caellwynai.com']

initialize_app()
# Lazy initialization of Firestore to avoid deployment errors
db = None

def log_mem(label):
    """Helper to log memory usage to console/Cloud Logs."""
    process = psutil.Process(os.getpid())
    mem_mb = process.memory_info().rss / (1024 * 1024)
    print(f"[MEMORY] {label}: {mem_mb:.2f} MB")

@https_fn.on_call(
    cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]),
    timeout_sec=300, # Increase timeout to 5 minutes for large PDFs
    memory=options.MemoryOption.GB_1 # Increased to 1GB to handle memory spikes
)
def extract_pdf(req: https_fn.CallableRequest) -> any:
    """
    Accepts a base64 PDF, sends it to Gemini, flattens results,
    and tracks usage/logs in Firestore.
    Consolidation is handled on the frontend for immediate edit feedback.
    """
    global db
    if db is None:
        db = firestore.client()

    log_mem("Start extract_pdf")
    start_time = time.time()
    
    # Enforce Authentication
    if not req.auth:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message="The function must be called while authenticated."
        )

    uid = req.auth.uid
    email = req.auth.token.get('email', '')

    try:
        # 1. Decode base64 file data - use pop to remove from request dict immediately
        file_data_b64 = req.data.pop('fileData', None)
        if not file_data_b64:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
                message="Missing 'fileData' in request."
            )
        
        log_mem(f"After pop b64 (len: {len(file_data_b64)})")
        file_bytes = base64.b64decode(file_data_b64)
        
        # Immediately delete the b64 string to free memory
        del file_data_b64
        gc.collect()
        log_mem("After b64 delete & GC")

        mime_type = req.data.get('mimeType', 'application/pdf')

        # 2. Count actual PDF pages using PyMuPDF (for accurate billing)
        page_count = 0
        if mime_type == 'application/pdf':
            try:
                pdf_doc = fitz.open(stream=file_bytes, filetype="pdf")
                page_count = pdf_doc.page_count
                pdf_doc.close()
                log_mem(f"After Page Count ({page_count} pages)")
            except Exception as pdf_error:
                print(f"Warning: Could not count PDF pages: {pdf_error}")
                # Fall back to counting from extracted items

        # 3. Call Gemini Extraction
        log_mem("Calling Gemini...")
        raw_result = extract_data(file_bytes, mime_type)
        
        # Cleanup bytes before processing results
        del file_bytes
        gc.collect()
        log_mem("After Gemini & bytes cleanup")

        # 4. Flatten Items (consolidation happens on frontend)
        final_result = flatten_items(raw_result)
        
        # Cleanup raw result
        del raw_result
        gc.collect()
        log_mem("After Flatten & raw cleanup")

        # Calculate metrics
        item_count = len(final_result.get('items', []))
        # Use actual page count from PyMuPDF, fall back to extracted pages if not available
        if page_count == 0:
            page_count = final_result.get('pageCount', 0)

        # Add page count to response for frontend display
        final_result['pageCount'] = page_count

        # 4. Atomic Write: Log Success + Increment Usage
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        log_mem("Starting Firestore write")
        batch = db.batch()
        
        # Reference to new extraction log
        extraction_ref = db.collection('extractions').document()
        batch.set(extraction_ref, {
            "userId": uid,
            "userEmail": email,
            "pageCount": page_count,
            "itemCount": item_count,
            "extractedAt": firestore.SERVER_TIMESTAMP,
            "processingTimeMs": processing_time_ms,
            "success": True,
            "errorType": None
        })
        
        # Reference to user doc for usage increment
        user_ref = db.collection('users').document(uid)
        batch.set(user_ref, {
            "pagesUsedThisPeriod": firestore.Increment(page_count),
            "lastActiveAt": firestore.SERVER_TIMESTAMP
        }, merge=True)
        
        # Commit batch
        batch.commit()
        log_mem("After Firestore write")

        return {
            "success": True,
            "data": final_result
        }

    except Exception as e:
        print(f"Error in extract_pdf: {e}")
        
        # Log Failure
        try:
            processing_time_ms = int((time.time() - start_time) * 1000)
            db.collection('extractions').add({
                "userId": uid,
                "userEmail": email,
                "pageCount": 0,
                "itemCount": 0,
                "extractedAt": firestore.SERVER_TIMESTAMP,
                "processingTimeMs": processing_time_ms,
                "success": False,
                "errorType": str(type(e).__name__), # e.g. "ValueError"
                "errorMessage": str(e)
            })
        except Exception as log_error:
            print(f"Failed to log error: {log_error}")

        # Re-raise https errors as is
        if isinstance(e, https_fn.HttpsError):
            raise e
        # Wrap unknown errors
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=str(e)
        )
