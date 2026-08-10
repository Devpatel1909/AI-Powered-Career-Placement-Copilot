import re
import io

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """
    Extracts raw text from a PDF file buffer using PyPDF with pdfplumber fallback.
    """
    text = ""
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    except Exception:
        pass

    if not text.strip():
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        except Exception as e:
            raise ValueError(f"Could not extract text from PDF: {str(e)}")

    return clean_extracted_text(text)

def clean_extracted_text(text: str) -> str:
    """
    Cleans raw PDF text by standardizing linebreaks, removing extra spaces,
    and trimming noise.
    """
    if not text:
        return ""
    # Normalize line endings
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    # Remove control characters except newlines/tabs
    text = re.sub(r'[^\x09\x0A\x20-\x7E]', ' ', text)
    # Collapse multiple blank lines
    text = re.sub(r'\n\s*\n', '\n\n', text)
    # Collapse multiple horizontal spaces
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()
