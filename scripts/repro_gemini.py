import os
from google import genai
from dotenv import load_dotenv

# Try to load from functions/.env
load_dotenv("../functions/.env")

project_id = os.getenv("GOOGLE_CLOUD_PROJECT") or "planpull"
location = os.getenv("GOOGLE_CLOUD_LOCATION") or "us-central1"

print(f"Using Project: {project_id}, Location: {location}")

try:
    client = genai.Client(
        vertexai=True,
        project=project_id,
        location=location
    )

    print("Attempting to generate content with gemini-3-flash-preview...")
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents="Hello"
    )
    print("Success! Response:")
    print(response.text)

except Exception as e:
    print(f"\nCAUGHT ERROR: {e}")
