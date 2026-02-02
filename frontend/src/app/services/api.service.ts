import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BackendAnalysisResponse {
  project: { title: string; script_name: string; };
  analysis: { naturalness_score: number; risk_level: string; confidence: number; };
  summary: { strengths: string[]; primary_issues: string[]; };
  issues_detected: Array<{ type: string; severity: string; description: string; }>;
  suggestions: Array<{ issue_type: string; recommendation: string; }>;
  explainability: { why_this_score: string; };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  analyzeScript(scriptText: string): Observable<BackendAnalysisResponse> {
    return this.http.post<BackendAnalysisResponse>(`${this.apiUrl}/analyze`, { script_text: scriptText });
  }
}
