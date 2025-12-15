from firebase_functions import https_fn
from firebase_admin import initialize_app

initialize_app()

@https_fn.on_call()
def extract_pdf(req: https_fn.CallableRequest) -> any:
    """
    Stub function for PDF extraction.
    In the future, this will accept a PDF file/URL, process it with Gemini,
    and return the extracted tabular data.
    """
    # TODO: Implement PDF processing logic
    
    return {
        "status": "success",
        "message": "PDF extraction stub called successfully",
        "data": {
            "items": [
                {"item": "Sample Item 1", "qty": 10, "unit": "ea"},
                {"item": "Sample Item 2", "qty": 5, "unit": "m2"}
            ],
            "pageCount": 1
        }
    }
