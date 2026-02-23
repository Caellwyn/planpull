import os
import base64
import sys
import psutil
import gc
from memory_profiler import profile

# Mock environment variables
os.environ["GOOGLE_CLOUD_PROJECT"] = "planpull"
os.environ["GOOGLE_CLOUD_LOCATION"] = "us-central1"

# Add functions dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "functions")))

import fitz  # PyMuPDF
from gemini_client import extract_data
from consolidation import flatten_items

def get_memory_usage():
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / (1024 * 1024)  # MB

@profile
def simulate_extraction(pdf_path):
    print(f"--- Starting Diagnostic for {pdf_path} ---")
    print(f"Initial Memory: {get_memory_usage():.2f} MB")
    
    # 1. Read file
    with open(pdf_path, "rb") as f:
        raw_bytes = f.read()
    print(f"1. After Read Bytes: {get_memory_usage():.2f} MB (Size: {len(raw_bytes)/(1024*1024):.2f} MB)")
    
    # 2. Simulate Base64 encoding (as if coming from request)
    file_data_b64 = base64.b64encode(raw_bytes).decode('utf-8')
    print(f"2. After Base64 Encode: {get_memory_usage():.2f} MB (String length: {len(file_data_b64)})")
    
    # 3. Simulate Cloud Function Receiving & Decoding
    file_bytes = base64.b64decode(file_data_b64)
    print(f"3. After Base64 Decode: {get_memory_usage():.2f} MB")

    # 4. Count pages
    try:
        pdf_doc = fitz.open(stream=file_bytes, filetype="pdf")
        page_count = pdf_doc.page_count
        pdf_doc.close()
        print(f"4. After PDF Page Count ({page_count} pages): {get_memory_usage():.2f} MB")
    except Exception as e:
        print(f"4. PDF Page Count Failed: {e}")

    # 5. Call Gemini
    print("5. Calling Gemini extraction...")
    raw_result = None
    try:
        raw_result = extract_data(file_bytes, "application/pdf")
        print(f"   Success! After Gemini Extraction: {get_memory_usage():.2f} MB")
    except Exception as e:
        print(f"   Gemini Extraction Failed (likely Auth): {e}")
        # Build a large mock result to see memory impact of processing/flattening
        print("   Simulating a large response...")
        raw_result = {
            'tables': [{'page': i, 'items': [{'item': f'Test Item {j}', 'quantity': j, 'unit': 'ea'} for j in range(100)]} for i in range(10)],
            'diagrams': []
        }
        print(f"   After Mock Result Creation: {get_memory_usage():.2f} MB")

    # 6. Flatten
    if raw_result:
        final_result = flatten_items(raw_result)
        item_count = len(final_result.get('items', []))
        print(f"6. After Flattening ({item_count} items): {get_memory_usage():.2f} MB")

    # 7. Cleanup simulation
    print("7. Performing cleanup...")
    del raw_bytes
    del file_data_b64
    del file_bytes
    if 'raw_result' in locals(): del raw_result
    gc.collect()
    print(f"   After Final Cleanup & GC: {get_memory_usage():.2f} MB")
    
    return final_result or {}

if __name__ == "__main__":
    pdf_path = os.path.join("sample_pdfs", "LocalscapesPlan.pdf")
    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} not found.")
        sys.exit(1)
        
    try:
        result = simulate_extraction(pdf_path)
    except Exception as e:
        print(f"Error during simulation: {e}")
