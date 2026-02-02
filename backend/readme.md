# SceneSpeak AI – Backend

FastAPI service that powers the dialogue analysis.

## Requirements

- Python 3.8+
- GROQ API key

## Setup (Windows PowerShell)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Setup (macOS/Linux)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Environment Variables

Set your key in the project root `.env` file:

```ini
GROQ_API_KEY=your_groq_api_key_here
```

## Run Server

```powershell
python -m uvicorn app.main:app --reload
```

## API Docs

Swagger UI: http://127.0.0.1:8000/docs
