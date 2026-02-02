import { Component, OnInit } from '@angular/core';
import { ApiService, BackendAnalysisResponse } from '../../services/api.service';

interface Character {
  name: string;
  lines: number;
  averageLength: number;
  emotions: string[];
}

interface AnalysisResult {
  score: number;
  risk: string;
  issues: string[];
  suggestions: string[];
  hasImage: boolean;
  hasText: boolean;
  characters?: Character[];
  emotions?: { [key: string]: number };
  sceneMood?: string;
  estimatedDuration?: string;
  alternativeSuggestions?: string[];
  timestamp?: Date;
  backendData?: BackendAnalysisResponse;
}

@Component({
  selector: 'app-analyze',
  templateUrl: './analyze.component.html',
  styleUrls: ['./analyze.component.css']
})
export class AnalyzeComponent implements OnInit {
  dialogueText: string = '';
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  result: AnalysisResult | null = null;
  loading: boolean = false;
  analysisHistory: AnalysisResult[] = [];
  showHistory: boolean = false;
  realTimeAnalysis: boolean = false;
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('analysisHistory');
    if (savedHistory) {
      this.analysisHistory = JSON.parse(savedHistory);
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  analyze() {
    this.loading = true;
    this.error = null;
    
    // Validate input
    if (!this.dialogueText.trim() && !this.selectedImage) {
      alert('Please provide either dialogue text or an image to analyze.');
      this.loading = false;
      return;
    }

    // Use the real backend API if dialogue text is provided
    if (this.dialogueText.trim()) {
      this.apiService.analyzeScript(this.dialogueText).subscribe({
        next: (backendResponse) => {
          // Process backend response and combine with local analysis
          const characters = this.analyzeCharacters();
          const emotions = this.detectEmotions();
          const sceneMood = this.determineSceneMood(emotions);
          const estimatedDuration = this.calculateDuration();
          const alternativeSuggestions = this.generateAlternatives();

          // Map backend response to frontend format
          this.result = {
            score: backendResponse.analysis.naturalness_score,
            risk: backendResponse.analysis.risk_level,
            issues: [
              ...backendResponse.summary.primary_issues,
              ...backendResponse.issues_detected.map(issue => 
                `${issue.type} (${issue.severity}): ${issue.description}`
              )
            ],
            suggestions: backendResponse.suggestions.map(s => 
              s.recommendation
            ),
            hasImage: !!this.selectedImage,
            hasText: true,
            characters,
            emotions,
            sceneMood,
            estimatedDuration,
            alternativeSuggestions,
            timestamp: new Date(),
            backendData: backendResponse
          };

          // Save to history
          this.saveToHistory(this.result);
          this.loading = false;
        },
        error: (error) => {
          console.error('Backend API error:', error);
          this.error = 'Failed to connect to backend API. Using local analysis instead.';
          
          // Fallback to local analysis
          this.performLocalAnalysis();
        }
      });
    } else {
      // Image-only analysis (local)
      this.performLocalAnalysis();
    }
  }

  private performLocalAnalysis() {
    const characters = this.analyzeCharacters();
    const emotions = this.detectEmotions();
    const sceneMood = this.determineSceneMood(emotions);
    const estimatedDuration = this.calculateDuration();
    const score = this.calculateScore();
    const risk = score < 4 ? 'High' : score < 7 ? 'Medium' : 'Low';
    const issues = this.generateIssues(score);
    const suggestions = this.generateSuggestions(score);
    const alternativeSuggestions = this.generateAlternatives();

    this.result = {
      score,
      risk,
      issues,
      suggestions,
      hasImage: !!this.selectedImage,
      hasText: !!this.dialogueText.trim(),
      characters,
      emotions,
      sceneMood,
      estimatedDuration,
      alternativeSuggestions,
      timestamp: new Date()
    };

    // Save to history
    this.saveToHistory(this.result);
    this.loading = false;
  }

  private calculateScore(): number {
    let score = 5; // Base score
    
    if (this.dialogueText.trim()) {
      // Score based on text length and quality
      const textLength = this.dialogueText.length;
      score = Math.min(10, Math.max(1, Math.floor(textLength / 50)));
    }
    
    if (this.selectedImage) {
      // Boost score if image is provided (simulated)
      score = Math.min(10, score + 1);
    }
    
    return score;
  }

  private generateIssues(score: number): string[] {
    const issues: string[] = [];
    
    if (score < 4) {
      issues.push('Dialogue appears too short or lacks context.');
      issues.push('Scene description may be insufficient.');
    } else if (score < 7) {
      issues.push('Some dialogue may sound unnatural.');
      issues.push('Consider adding more emotional context.');
    }
    
    if (!this.selectedImage) {
      issues.push('No scene image provided for visual context analysis.');
    }
    
    return issues.length > 0 ? issues : ['No major issues detected.'];
  }

  private generateSuggestions(score: number): string[] {
    const suggestions: string[] = [];
    
    if (score < 7) {
      suggestions.push('Try expanding the dialogue with more natural conversation flow.');
      suggestions.push('Add character emotions and reactions.');
      suggestions.push('Consider the scene context and environment.');
    } else {
      suggestions.push('Dialogue looks natural and well-structured!');
      suggestions.push('Consider testing with actors for real-world feedback.');
    }
    
    if (!this.selectedImage) {
      suggestions.push('Upload a scene image for comprehensive visual-text analysis.');
    } else {
      suggestions.push('Image context can help validate dialogue authenticity.');
    }
    
    return suggestions;
  }

  reset() {
    this.dialogueText = '';
    this.selectedImage = null;
    this.imagePreview = null;
    this.result = null;
    this.loading = false;
  }

  analyzeCharacters(): Character[] {
    if (!this.dialogueText.trim()) return [];

    const lines = this.dialogueText.split('\n').filter(l => l.trim());
    const characterMap = new Map<string, { lines: number, totalLength: number, texts: string[] }>();

    lines.forEach(line => {
      const match = line.match(/^([A-Z][A-Za-z\s]+):\s*(.+)$/);
      if (match) {
        const name = match[1].trim();
        const dialogue = match[2].trim();
        
        if (!characterMap.has(name)) {
          characterMap.set(name, { lines: 0, totalLength: 0, texts: [] });
        }
        
        const charData = characterMap.get(name)!;
        charData.lines++;
        charData.totalLength += dialogue.length;
        charData.texts.push(dialogue);
      }
    });

    return Array.from(characterMap.entries()).map(([name, data]) => ({
      name,
      lines: data.lines,
      averageLength: Math.round(data.totalLength / data.lines),
      emotions: this.detectCharacterEmotions(data.texts)
    }));
  }

  detectCharacterEmotions(texts: string[]): string[] {
    const emotionKeywords = {
      'happy': ['happy', 'joy', 'smile', 'laugh', 'excited', 'wonderful'],
      'sad': ['sad', 'cry', 'tears', 'sorry', 'depressed', 'unhappy'],
      'angry': ['angry', 'mad', 'furious', 'hate', 'damn', 'rage'],
      'fear': ['scared', 'afraid', 'terrified', 'nervous', 'worried'],
      'surprised': ['wow', 'amazing', 'incredible', 'shocked', 'can\'t believe']
    };

    const detectedEmotions = new Set<string>();
    const fullText = texts.join(' ').toLowerCase();

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      if (keywords.some(keyword => fullText.includes(keyword))) {
        detectedEmotions.add(emotion);
      }
    });

    return detectedEmotions.size > 0 ? Array.from(detectedEmotions) : ['neutral'];
  }

  detectEmotions(): { [key: string]: number } {
    const text = this.dialogueText.toLowerCase();
    const emotions: { [key: string]: number } = {
      happy: 0,
      sad: 0,
      angry: 0,
      fear: 0,
      neutral: 0
    };

    const keywords = {
      happy: ['happy', 'joy', 'smile', 'laugh', 'love', 'wonderful', 'great', 'excited'],
      sad: ['sad', 'cry', 'tears', 'sorry', 'miss', 'alone', 'depressed'],
      angry: ['angry', 'mad', 'hate', 'furious', 'rage', 'damn', 'stupid'],
      fear: ['scared', 'afraid', 'terrified', 'nervous', 'worried', 'anxious']
    };

    Object.entries(keywords).forEach(([emotion, words]) => {
      words.forEach(word => {
        const count = (text.match(new RegExp(word, 'g')) || []).length;
        emotions[emotion] += count;
      });
    });

    const total = Object.values(emotions).reduce((a, b) => a + b, 0);
    if (total === 0) emotions['neutral'] = 1;

    return emotions;
  }

  determineSceneMood(emotions: { [key: string]: number }): string {
    const max = Math.max(...Object.values(emotions));
    const dominantEmotion = Object.entries(emotions).find(([_, val]) => val === max)?.[0] || 'neutral';
    
    const moodMap: { [key: string]: string } = {
      happy: 'Uplifting & Positive',
      sad: 'Melancholic & Somber',
      angry: 'Tense & Confrontational',
      fear: 'Suspenseful & Anxious',
      neutral: 'Calm & Balanced'
    };

    return moodMap[dominantEmotion] || 'Mixed Emotions';
  }

  calculateDuration(): string {
    if (!this.dialogueText.trim()) return '0:00';

    // Average speaking rate: 150 words per minute
    const words = this.dialogueText.split(/\s+/).length;
    const minutes = words / 150;
    const totalSeconds = Math.round(minutes * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  generateAlternatives(): string[] {
    const alternatives: string[] = [];
    
    if (this.dialogueText.length < 100) {
      alternatives.push('"Consider expanding this dialogue to give more depth to the scene."');
      alternatives.push('"Add character reactions and emotional beats between lines."');
    }
    
    alternatives.push('"Try reading the dialogue out loud to test its naturalness."');
    alternatives.push('"Consider adding subtext - what are characters NOT saying?"');
    alternatives.push('"Use contractions and informal language for more authentic speech."');
    
    return alternatives;
  }

  saveToHistory(result: AnalysisResult): void {
    this.analysisHistory.unshift(result);
    if (this.analysisHistory.length > 10) {
      this.analysisHistory = this.analysisHistory.slice(0, 10);
    }
    localStorage.setItem('analysisHistory', JSON.stringify(this.analysisHistory));
  }

  loadFromHistory(index: number): void {
    const historyItem = this.analysisHistory[index];
    if (historyItem) {
      this.result = historyItem;
      this.dialogueText = ''; // Clear current text
      this.showHistory = false;
    }
  }

  clearHistory(): void {
    if (confirm('Are you sure you want to clear all analysis history?')) {
      this.analysisHistory = [];
      localStorage.removeItem('analysisHistory');
    }
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
  }

  exportResults(format: string): void {
    if (!this.result) return;

    if (format === 'json') {
      const dataStr = JSON.stringify(this.result, null, 2);
      this.downloadFile(dataStr, 'scenespeak-analysis.json', 'application/json');
    } else if (format === 'txt') {
      let text = `SceneSpeak AI Analysis\n`;
      text += `========================\n\n`;
      text += `Score: ${this.result.score}/10\n`;
      text += `Risk Level: ${this.result.risk}\n`;
      text += `Scene Mood: ${this.result.sceneMood}\n`;
      text += `Duration: ${this.result.estimatedDuration}\n\n`;
      text += `Issues:\n${this.result.issues.map(i => `- ${i}`).join('\n')}\n\n`;
      text += `Suggestions:\n${this.result.suggestions.map(s => `- ${s}`).join('\n')}\n`;
      
      this.downloadFile(text, 'scenespeak-analysis.txt', 'text/plain');
    }
  }

  private downloadFile(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getEmotionPercentage(emotion: string): number {
    if (!this.result?.emotions) return 0;
    const total = Object.values(this.result.emotions).reduce((a, b) => a + b, 0);
    return total > 0 ? Math.round((this.result.emotions[emotion] / total) * 100) : 0;
  }

  getEmotionColor(emotion: string): string {
    const colors: { [key: string]: string } = {
      happy: '#28a745',
      sad: '#6c757d',
      angry: '#dc3545',
      fear: '#ffc107',
      neutral: '#17a2b8'
    };
    return colors[emotion] || '#6c757d';
  }
}
