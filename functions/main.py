from firebase_functions import https_fn, options
from firebase_admin import initialize_app
import base64
from gemini_client import extract_data

initialize_app()

@https_fn.on_call(
    cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"])
)
def extract_pdf(req: https_fn.CallableRequest) -> any:
    """
    Accepts a base64 PDF, sends it to Gemini, and returns extracted data.
    """
    # Enforce Authentication
    if not req.auth:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message="The function must be called while authenticated."
        )

    try:
        # 1. Decode base64 file data
        file_data_b64 = req.data.get('fileData')
        if not file_data_b64:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
                message="Missing 'fileData' in request."
            )
        
        file_bytes = base64.b64decode(file_data_b64)
        mime_type = req.data.get('mimeType', 'application/pdf')

        # 2. Call Gemini Extraction
        result = extract_data(file_bytes, mime_type)

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        print(f"Error in extract_pdf: {e}")
        # Re-raise https errors as is
        if isinstance(e, https_fn.HttpsError):
            raise e
        # Wrap unknown errors
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=str(e)
        )
