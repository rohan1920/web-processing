from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from extractor import DocumentExtractor
from table_extractor import TableExtractor
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
table_extractor = TableExtractor()


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
    import os
    
    try:
        file_path = request.file_path
        print(f"[TEXT EXTRACT] Received request for file: {file_path}")
        
        # Normalize and resolve path
        file_path = os.path.normpath(file_path)
        
        # If path is relative, try to find it
        if not os.path.isabs(file_path):
            possible_paths = [
                file_path,
                os.path.join("..", "backend", file_path),
                os.path.join("..", file_path),
            ]
            
            for p in possible_paths:
                normalized = os.path.normpath(p)
                if os.path.exists(normalized):
                    file_path = normalized
                    break
        
        print(f"[TEXT EXTRACT] Final path: {file_path}")
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"File not found: {file_path}")
        
        # Extract text from PDF
        extracted_text = extractor.extract_from_pdf(file_path)
        
        return {
            "success": True,
            "file_path": file_path,
            "extractedText": extracted_text
        }
    except HTTPException:
        raise
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File not found: {request.file_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@app.post("/extract-tables")
async def extract_tables(request: ExtractRequest):
    """
    Extract tables from PDF file using pdfplumber.
    Input: { "file_path": "path/to/file.pdf" }
    Output: JSON with tables array containing rows, columns, and data
    """
    import traceback
    import os
    
    try:
        file_path = request.file_path
        print(f"[TABLE EXTRACT] Received request for file: {file_path}")
        
        # Normalize file path (handle Windows paths)
        file_path = os.path.normpath(file_path)
        
        # If path is relative, try to find it relative to backend/uploads
        if not os.path.isabs(file_path):
            # Try multiple locations
            possible_paths = [
                file_path,  # Current directory
                os.path.join("..", "backend", file_path),  # ../backend/uploads/...
                os.path.join("..", file_path),  # ../uploads/...
                os.path.abspath(file_path),
            ]
            
            found_path = None
            for p in possible_paths:
                normalized = os.path.normpath(p)
                print(f"[TABLE EXTRACT] Checking path: {normalized}")
                if os.path.exists(normalized):
                    found_path = normalized
                    break
            
            if found_path:
                file_path = found_path
            else:
                print(f"[TABLE EXTRACT] Tried paths: {possible_paths}")
        
        print(f"[TABLE EXTRACT] Final path: {file_path}")
        
        # Check if file exists
        if not os.path.exists(file_path):
            error_msg = f"File not found: {file_path}"
            print(f"[TABLE EXTRACT] ERROR: {error_msg}")
            raise HTTPException(status_code=404, detail=error_msg)
        
        print(f"[TABLE EXTRACT] File exists. Starting extraction...")
        
        # Extract tables from PDF
        tables = table_extractor.extract_tables_from_pdf(file_path)
        
        print(f"[TABLE EXTRACT] Extraction complete. Found {len(tables)} tables")
        
        # Format response according to specification
        formatted_tables = []
        for table in tables:
            formatted_tables.append({
                "rows": table["rows"],
                "columns": table["columns"],
                "data": table["data"],
                "page": table.get("page"),
                "table_index": table.get("table_index")
            })
        
        return {
            "success": True,
            "file_path": file_path,
            "tables": formatted_tables
        }
    except FileNotFoundError as e:
        error_msg = f"File not found: {request.file_path}"
        print(f"[TABLE EXTRACT] ERROR: {error_msg}")
        print(f"[TABLE EXTRACT] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=404, detail=error_msg)
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        error_msg = f"Error extracting tables: {str(e)}"
        print(f"[TABLE EXTRACT] ERROR: {error_msg}")
        print(f"[TABLE EXTRACT] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=error_msg)


@app.get("/")
async def root():
    return {"message": "Document Processing Service API"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
