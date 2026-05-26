import os
import uuid
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
BUCKET_NAME = "transit_permits"

def upload_pdf_to_supabase(pdf_bytes: bytes, filename: str) -> str:
    """
    Uploads a PDF to Supabase Storage and returns the public URL.
    Falls back to local static serving if Supabase is not configured.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Warning: Supabase credentials not found. Falling back to local storage.")
        os.makedirs("static/pdfs", exist_ok=True)
        local_path = os.path.join("static/pdfs", filename)
        with open(local_path, "wb") as f:
            f.write(pdf_bytes)
        return f"/static/pdfs/{filename}"
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Attempt to upload
        # Note: If the file already exists, this might raise an exception depending on bucket config.
        # It's better to ensure unique filenames.
        res = supabase.storage.from_(BUCKET_NAME).upload(
            file=pdf_bytes,
            path=filename,
            file_options={"content-type": "application/pdf"}
        )
        
        # Get public URL
        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(filename)
        return public_url
    except Exception as e:
        print(f"Failed to upload to Supabase: {e}")
        print("Falling back to local storage.")
        os.makedirs("static/pdfs", exist_ok=True)
        local_path = os.path.join("static/pdfs", filename)
        with open(local_path, "wb") as f:
            f.write(pdf_bytes)
        return f"/static/pdfs/{filename}"

def upload_qr_to_supabase(image_bytes: bytes, filename: str) -> str:
    """
    Uploads a QR code image to Supabase Storage and returns the public URL.
    Falls back to local static serving if Supabase is not configured.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        os.makedirs("static/qrcodes", exist_ok=True)
        local_path = os.path.join("static/qrcodes", filename)
        with open(local_path, "wb") as f:
            f.write(image_bytes)
        return f"/static/qrcodes/{filename}"
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        supabase.storage.from_(BUCKET_NAME).upload(
            file=image_bytes,
            path=f"qrcodes/{filename}",
            file_options={"content-type": "image/png"}
        )
        
        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(f"qrcodes/{filename}")
        return public_url
    except Exception as e:
        print(f"Failed to upload QR to Supabase: {e}")
        os.makedirs("static/qrcodes", exist_ok=True)
        local_path = os.path.join("static/qrcodes", filename)
        with open(local_path, "wb") as f:
            f.write(image_bytes)
        return f"/static/qrcodes/{filename}"
