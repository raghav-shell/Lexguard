import pdfplumber
import io

async def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from a PDF file robustly, preserving paragraph boundaries where possible.
    """
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
    except Exception as e:
        print(f"PDF extraction error: {e}")
        # In a real scenario we might throw a specific exception.
        # For the hackathon MVP, returning whatever we got or empty string.
    return text.strip()
