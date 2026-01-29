
export enum SafetyLevel {
  SAFE = 'SAFE',
  SUSPICIOUS = 'SUSPICIOUS',
  DANGEROUS = 'DANGEROUS'
}

export interface AnalysisResult {
  level: SafetyLevel;
  explanation: string;
  recommendations: string[];
}

export interface SafetyTip {
  id: string;
  title: string;
  content: string;
  category: 'UPI' | 'PHISHING' | 'SOCIAL' | 'PASSWORD';
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: 'message' | 'upi' | 'profile';
  input: string;
  result: AnalysisResult;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type Page = 'home' | 'scam-check' | 'upi-check' | 'profile-check' | 'emergency' | 'awareness' | 'history' | 'queries';
