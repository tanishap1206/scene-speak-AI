from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import AnalyzeRequest, AnalyzeResponse
from app.ai_engine import analyze_dialogue_with_ai

app = FastAPI(title="SceneSpeak AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status": "running"}

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_script(payload: AnalyzeRequest):
    return analyze_dialogue_with_ai(payload.script_text)
