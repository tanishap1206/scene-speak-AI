# SceneSpeak AI

AI-powered dialogue analysis for screenwriters.

## ✨ Features

- Analyze scene dialogue with AI
- FastAPI backend + Angular frontend
- Simple local development setup

## 📦 Requirements

- Python 3.8+
- Node.js 16+
- GROQ API key: [console.groq.com](https://console.groq.com)

## ⚙️ Setup

1. Create a `.env` file in the project root (already included here as a placeholder):

	```ini
	GROQ_API_KEY=your_groq_api_key_here
	```

2. Install dependencies:

	```powershell
	# Backend
	cd backend
	python -m venv venv
	.\venv\Scripts\Activate.ps1
	pip install -r requirements.txt

	# Frontend
	cd ..\frontend
	npm install
	```

## ▶️ Run (Windows)

Open two terminals from the project root:

**Terminal 1 — Backend**

```powershell
.\start-backend.bat
```

**Terminal 2 — Frontend**

```powershell
.\start-frontend.bat
```

Then open: http://localhost:4200

## 🧭 Usage

1. Enter dialogue in the format: `CHARACTER: dialogue text`
2. Click **Analyze Scene**
3. Review the AI-generated analysis

## 🩺 Troubleshooting

- Backend won’t start: verify `GROQ_API_KEY` is set in `.env`
- Frontend won’t start: run `npm install` in `frontend`
- Connection error: ensure both servers are running

## 📁 Project Docs

- Backend details: `backend/readme.md`
- Frontend details: `frontend/README.md`
