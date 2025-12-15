from firebase_functions import https_fn, options
from firebase_admin import initialize_app

initialize_app()

@https_fn.on_call(
    cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"])
)
def extract_pdf(req: https_fn.CallableRequest) -> any:
    """
    Stub function for PDF extraction.
    In the future, this will accept a PDF file/URL, process it with Gemini,
    and return the extracted tabular data.
    """
    # Enforce Authentication
    if not req.auth:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message="The function must be called while authenticated."
        )

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
