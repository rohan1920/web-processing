from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from extractor import DocumentExtractor
import uvicorn

app = FastAPI(title="Document Processing Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

extractor = DocumentExtractor()


class ExtractRequest(BaseModel):
    file_path: str


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "document-processing"}


@app.post("/extract")
async def extract_text(request: ExtractRequest):
    """
    Extract text from PDF file using pdfplumber.
    Input: { "file_path": "path/to/file.pdf" }
    """
    try:
        file_path = request.file_path
        
        # Extract text from PDF
        extracted_text = extractor.extract_from_pdf(file_path)
        
        return {
            "success": True,
            "file_path": file_path,
            "extractedText": extracted_text
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File not found: {request.file_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@app.get("/")
async def root():
    return {"message": "Document Processing Service API"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
