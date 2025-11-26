import pdfplumber
import os
from typing import List, Dict, Any


class TableExtractor:
    """
    Handles table extraction from PDF files using pdfplumber.
    """

    def __init__(self):
        pass

    def extract_tables_from_pdf(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Extract tables from PDF file using pdfplumber.
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            List of tables, where each table is a dict with:
            - rows: number of rows
            - columns: number of columns
            - data: 2D array of cell values
        """
        import traceback
        
        print(f"[TABLE EXTRACTOR] Starting extraction from: {file_path}")
        
        # Normalize path
        file_path = os.path.normpath(file_path)
        
        if not os.path.exists(file_path):
            error_msg = f"File not found: {file_path}"
            print(f"[TABLE EXTRACTOR] ERROR: {error_msg}")
            raise FileNotFoundError(error_msg)

        if not file_path.lower().endswith('.pdf'):
            error_msg = f"File is not a PDF: {file_path}"
            print(f"[TABLE EXTRACTOR] ERROR: {error_msg}")
            raise ValueError(error_msg)

        extracted_tables = []
        
        try:
            print(f"[TABLE EXTRACTOR] Opening PDF file...")
            with pdfplumber.open(file_path) as pdf:
                total_pages = len(pdf.pages)
                print(f"[TABLE EXTRACTOR] PDF opened. Total pages: {total_pages}")
                
                # Extract tables from each page
                for page_num, page in enumerate(pdf.pages):
                    print(f"[TABLE EXTRACTOR] Processing page {page_num + 1}/{total_pages}...")
                    
                    # Extract tables from the page
                    tables = page.extract_tables()
                    print(f"[TABLE EXTRACTOR] Found {len(tables) if tables else 0} tables on page {page_num + 1}")
                    
                    if tables:
                        for table_idx, table in enumerate(tables):
                            if table and len(table) > 0:
                                print(f"[TABLE EXTRACTOR] Processing table {table_idx + 1} on page {page_num + 1}...")
                                
                                # Clean and process the table
                                cleaned_table = self._clean_table(table)
                                
                                if cleaned_table and len(cleaned_table) > 0:
                                    rows = len(cleaned_table)
                                    columns = max(len(row) for row in cleaned_table) if cleaned_table else 0
                                    
                                    extracted_tables.append({
                                        "page": page_num + 1,
                                        "table_index": table_idx + 1,
                                        "rows": rows,
                                        "columns": columns,
                                        "data": cleaned_table
                                    })
                                    print(f"[TABLE EXTRACTOR] Table added: {rows} rows × {columns} columns")
                                else:
                                    print(f"[TABLE EXTRACTOR] Table {table_idx + 1} on page {page_num + 1} is empty after cleaning")
            
            print(f"[TABLE EXTRACTOR] Extraction complete. Total tables found: {len(extracted_tables)}")
            
            # Return empty array if no tables found (this is valid - PDF might not have tables)
            if len(extracted_tables) == 0:
                print(f"[TABLE EXTRACTOR] INFO: No tables found in PDF. This is normal if the PDF doesn't contain structured tables.")
            
            return extracted_tables
            
        except FileNotFoundError:
            raise
        except ValueError:
            raise
        except Exception as e:
            error_msg = f"Error extracting tables from PDF: {str(e)}"
            print(f"[TABLE EXTRACTOR] ERROR: {error_msg}")
            print(f"[TABLE EXTRACTOR] Traceback: {traceback.format_exc()}")
            raise Exception(error_msg)

    def _clean_table(self, table: List[List]) -> List[List[str]]:
        """
        Clean and normalize table data.
        - Remove None values
        - Convert all values to strings
        - Trim whitespace
        - Remove completely empty rows
        """
        cleaned = []
        
        for row in table:
            if row is None:
                continue
                
            cleaned_row = []
            has_content = False
            
            for cell in row:
                if cell is None:
                    cleaned_cell = ""
                else:
                    cleaned_cell = str(cell).strip()
                    if cleaned_cell:
                        has_content = True
                cleaned_row.append(cleaned_cell)
            
            # Only add row if it has some content
            if has_content or len(cleaned_row) > 0:
                cleaned.append(cleaned_row)
        
        # Ensure all rows have the same number of columns
        if cleaned:
            max_cols = max(len(row) for row in cleaned)
            for row in cleaned:
                while len(row) < max_cols:
                    row.append("")
        
        return cleaned

