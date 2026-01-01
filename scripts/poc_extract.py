import os
import json
import pandas as pd
from typing import List, Optional
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION")

if not PROJECT_ID or not LOCATION:
    print("Error: GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION must be set in .env file.")
    exit(1)

# Define Data Models
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
    return genai.Client(
        vertexai=True,
        project=PROJECT_ID,
        location="global"
        # location=LOCATION
    )

def list_input_files():
    input_dir = "input"
    if not os.path.exists(input_dir):
        os.makedirs(input_dir)
    files = [f for f in os.listdir(input_dir) if f.lower().endswith(".pdf")]
    return files

def select_file(files):
    if not files:
        print("No PDF files found in 'input' directory.")
        return None
    
    print("\nAvailable files:")
    for i, f in enumerate(files):
        print(f"{i+1}. {f}")
    
    while True:
        try:
            choice = int(input("\nSelect a file number: "))
            if 1 <= choice <= len(files):
                return files[choice-1]
            print("Invalid selection.")
        except ValueError:
            print("Please enter a number.")

def extract_content(client, file_path):
    print(f"Extracting from {file_path}...")
    
    with open(file_path, "rb") as f:
        file_content = f.read()

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

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(data=file_content, mime_type="application/pdf"),
            prompt
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ExtractionResult
        )
    )
    
    return response.parsed

def get_unique_path(directory, filename):
    base, ext = os.path.splitext(filename)
    counter = 1
    path = os.path.join(directory, filename)
    while os.path.exists(path):
        path = os.path.join(directory, f"{base}_{counter}{ext}")
        counter += 1
    return path

def save_results(filename, result: ExtractionResult):
    base_name = os.path.splitext(filename)[0]
    output_dir = "output"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    # Save JSON
    json_filename = f"{base_name}.json"
    json_path = get_unique_path(output_dir, json_filename)
    
    with open(json_path, "w") as f:
        f.write(result.model_dump_json(indent=2))
    print(f"JSON saved to {json_path}")
    
    # Convert to CSV
    rows = []
    
    # Process tables
    if result.tables:
        for table in result.tables:
            for item in table.items:
                rows.append({
                    "Source": "Table",
                    "Page": table.page,
                    "Area": None,
                    "Index": item.index,
                    "Item": item.item,
                    "Quantity": item.quantity,
                    "Unit": item.unit
                })
                
    # Process diagrams
    if result.diagrams:
        for diagram in result.diagrams:
            for item in diagram.items:
                rows.append({
                    "Source": "Diagram",
                    "Page": diagram.page,
                    "Area": diagram.area,
                    "Index": item.index,
                    "Item": item.item,
                    "Quantity": item.quantity,
                    "Unit": item.unit
                })
    
    if rows:
        df = pd.DataFrame(rows)
        # Use the same version number/suffix as the JSON file if possible, or generate a new unique one
        # To keep them synced, we can derive the CSV name from the JSON name
        json_basename = os.path.splitext(os.path.basename(json_path))[0]
        csv_filename = f"{json_basename}.csv"
        csv_path = os.path.join(output_dir, csv_filename)
        
        # Double check if it exists (unlikely if we just generated the unique JSON name, but good for safety)
        if os.path.exists(csv_path):
             csv_path = get_unique_path(output_dir, f"{base_name}.csv")

        df.to_csv(csv_path, index=False)
        print(f"CSV saved to {csv_path}")
    else:
        print("No items extracted to save to CSV.")

def main():
    files = list_input_files()
    selected_file = select_file(files)
    if not selected_file:
        return

    try:
        client = get_client()
        file_path = os.path.join("input", selected_file)
        result = extract_content(client, file_path)
        
        if result:
            save_results(selected_file, result)
            
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
