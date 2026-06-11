export interface GameSession {
  id: string;
  currentPage: string;
  targetPage: string;
  path: string[];
  steps: number;
  startTime: number;
  status: 'playing' | 'won' | 'abandoned';
}