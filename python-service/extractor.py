import pdfplumber
import os


class DocumentExtractor:
    """
    Handles text extraction from PDF files using pdfplumber.
    """

    def __init__(self):
        pass

    def extract_from_pdf(self, file_path: str) -> str:
        """
        Extract text from PDF file using pdfplumber.
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            Extracted text as a string
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        if not file_path.lower().endswith('.pdf'):
            raise ValueError(f"File is not a PDF: {file_path}")

        extracted_text = []
        
        try:
            with pdfplumber.open(file_path) as pdf:
                # Extract text from each page
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        extracted_text.append(page_text.strip())
            
            # Join all pages with double newline
            result = "\n\n".join(extracted_text)
            
            if not result.strip():
                return "No text found in PDF. The PDF might contain only images."
            
            return result
            
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
