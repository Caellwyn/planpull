import os
from typing import List, Optional
from pydantic import BaseModel
from google import genai
from google.genai import types

# Define Data Models (matching poc_extract.py)
class Item(BaseModel):
    index: Optional[str] = None
    item: str
    quantity: float
    unit: Optional[str] = None

class TableExtraction(BaseModel):
    page: int
    items: List[Item]

class DiagramExtraction(BaseModel):
    page: int
    area: Optional[str] = None
    items: List[Item]

class ExtractionResult(BaseModel):
    tables: List[TableExtraction]
    diagrams: List[DiagramExtraction]

def get_client():
    """Initializes the Gemini client using environment variables."""
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT") or os.environ.get("GCP_PROJECT")
    location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
    
    if not project_id:
        print("Warning: GOOGLE_CLOUD_PROJECT not set, using default 'planpull'")
        project_id = "planpull"

    return genai.Client(
        vertexai=True,
        project=project_id,
        location="global"
        # location=location
    )

def extract_data(file_content: bytes, mime_type: str) -> dict:
    """
    Sends the file content to Gemini 2.0 Flash for extraction.
    Returns the parsed JSON dictionary.
    """
    client = get_client()

    prompt = """
    You are extracting material quantities from a landscaping document.

    INSTRUCTIONS:
    - Extract every item with its quantity
    - Preserve item names exactly as written (do not normalize or deduplicate)
    - If the table has an index/ID column, preserve it in the 'index' field
    - If a unit is specified (ea, sf, cy, etc.), include it
    - For diagrams: include the area/zone name if annotations are grouped by area
    - If quantity is unclear, use your best estimate.

    Return ONLY valid JSON matching the provided schema.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=file_content, mime_type=mime_type),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ExtractionResult
            )
        )
        
        # Return the Pydantic model dumped as a dictionary
        if response.parsed:
            return response.parsed.model_dump()
        else:
            raise ValueError("Gemini returned empty parsed response")

    except Exception as e:
        print(f"Error in Gemini extraction: {e}")
        raise e
