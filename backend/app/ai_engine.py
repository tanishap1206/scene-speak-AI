import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_dialogue_with_ai(script_text: str) -> dict:
    system_prompt = """You are an expert screenplay dialogue analyst with 20 years of experience in film and television writing. You evaluate dialogue for naturalness, character voice, pacing, and authenticity. You provide specific, actionable feedback."""
    
    user_prompt = f"""Analyze this screenplay dialogue and rate its naturalness on a scale of 0-10.

EXAMPLES OF RATINGS:

SCORE 9-10 (Excellent):
JOHN: You coming to the bar later?
MARY: Can't. Got that thing.
JOHN: Right, the thing. Good luck with that.
→ Natural contractions, casual tone, realistic flow

SCORE 5-6 (Mediocre):
JOHN: Are you planning to attend the bar establishment later this evening?
MARY: I am unable to attend because I have a prior commitment.
→ Too formal, unnatural phrasing, no personality

SCORE 2-3 (Poor):
JOHN: Hello Mary. I was wondering if you would like to go to the bar.
MARY: No John. I have something to do. It is very important.
JOHN: I understand Mary. That is fine.
→ Robotic, repetitive names, exposition, no subtext

NOW ANALYZE THIS DIALOGUE:
{script_text}

EVALUATE:
- Does it sound like real people talking?
- Are there contractions and natural speech patterns?
- Is there unnecessary exposition or info-dumping?
- Do characters have distinct voices?
- Is the pacing natural or forced?

Be honest and critical. Most dialogue has issues. Don't give high scores unless it truly sounds natural.

INSTRUCTIONS:
1. Evaluate naturalness honestly based on the scoring guide
2. Identify 2-3 specific strengths (or state if there are none)
3. Identify 2-4 specific issues (be critical but fair)
4. Provide 2-4 actionable suggestions for improvement
5. Explain your score in 2-3 sentences

Return ONLY this JSON (no markdown, no code blocks, no extra text):
{{
  "project": {{"title": "SceneSpeak AI", "script_name": "Dialogue Analysis"}},
  "analysis": {{
    "naturalness_score": <integer 0-10>,
    "risk_level": "<Low or Medium or High>",
    "confidence": <float 0.7-0.95>
  }},
  "summary": {{
    "strengths": ["strength 1", "strength 2"],
    "primary_issues": ["issue 1", "issue 2", "issue 3"]
  }},
  "issues_detected": [
    {{"type": "Dialogue Quality", "severity": "Medium", "description": "specific issue description"}},
    {{"type": "Character Voice", "severity": "Low", "description": "another specific issue"}}
  ],
  "suggestions": [
    {{"issue_type": "Naturalness", "recommendation": "specific actionable suggestion"}},
    {{"issue_type": "Pacing", "recommendation": "another specific suggestion"}}
  ],
  "explainability": {{
    "why_this_score": "Clear 2-3 sentence explanation of the score"
  }}
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=2000,
            top_p=0.9
        )
        raw = response.choices[0].message.content.strip()
        
        # Extract JSON
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start == -1 or end == 0:
            raise ValueError("No JSON found in response")
        
        parsed = json.loads(raw[start:end])
        
        # Validate score
        score = parsed.get("analysis", {}).get("naturalness_score", 5)
        if not isinstance(score, (int, float)) or score < 0 or score > 10:
            parsed["analysis"]["naturalness_score"] = 5
        
        return parsed
        
    except Exception as e:
        print(f"AI Error: {e}")
        return {
            "project": {"title": "SceneSpeak AI", "script_name": "Analysis"},
            "analysis": {"naturalness_score": 5, "risk_level": "Medium", "confidence": 0.5},
            "summary": {
                "strengths": ["Unable to analyze"],
                "primary_issues": ["AI service error - please retry"]
            },
            "issues_detected": [{
                "type": "System Error",
                "severity": "Low",
                "description": f"Analysis failed: {str(e)}"
            }],
            "suggestions": [{
                "issue_type": "Technical",
                "recommendation": "Please try analyzing again or check your API connection"
            }],
            "explainability": {
                "why_this_score": "Unable to complete analysis due to technical error. Default score provided."
            }
        }
