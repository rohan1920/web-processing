# Starting the Python Service

## Quick Start

### Windows (Command Prompt or PowerShell):
```bash
cd python-service
python api.py
```

Or double-click: `start-python-service.bat`

### Mac/Linux:
```bash
cd python-service
python3 api.py
```

Or run: `bash start-python-service.sh`

## Install Dependencies First (if not already installed)

```bash
cd python-service
pip install -r requirements.txt
```

## Verify Service is Running

Once started, you should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

You can test it by visiting: http://localhost:8000/health

It should return:
```json
{"status":"ok","service":"document-processing"}
```

## Troubleshooting

1. **Port 8000 already in use**: Change the port in `api.py` or stop the other service
2. **Python not found**: Make sure Python 3.8+ is installed
3. **Module not found**: Run `pip install -r requirements.txt` in the python-service folder

