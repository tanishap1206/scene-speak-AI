from pydantic import BaseModel
from typing import List

class AnalyzeRequest(BaseModel):
    script_text: str

class Issue(BaseModel):
    type: str
    severity: str
    description: str

class Suggestion(BaseModel):
    issue_type: str
    recommendation: str

class AnalyzeResponse(BaseModel):
    project: dict
    analysis: dict
    summary: dict
    issues_detected: List[Issue]
    suggestions: List[Suggestion]
    explainability: dict
