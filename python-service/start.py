#!/usr/bin/env python3
"""
Start script for Python Document Processing Service
"""
import subprocess
import sys
import os

def check_dependencies():
    """Check if required packages are installed"""
    try:
        import fastapi
        import uvicorn
        import pdfplumber
        print("✓ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"✗ Missing dependency: {e.name}")
        print("Please install dependencies: pip install -r requirements.txt")
        return False

def main():
    print("=" * 50)
    print("Python Document Processing Service")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Start the service
    print("\nStarting service on http://localhost:8000")
    print("Press Ctrl+C to stop\n")
    
    try:
        import uvicorn
        uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
    except KeyboardInterrupt:
        print("\n\nService stopped by user")
    except Exception as e:
        print(f"\n✗ Error starting service: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

