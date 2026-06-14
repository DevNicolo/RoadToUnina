import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GameService {
    private apiUrl = `${environment.apiUrl}/game`;
    private http = inject(HttpClient);

    getCurrentGame(): Observable<{ success: boolean; game: any }> {
        return this.http.get<{ success: boolean; game: any }>(`${this.apiUrl}/current`);
    }

    startGame(): Observable<{ success: boolean; game: any }> {
        return this.http.get<{ success: boolean; game: any }>(`${this.apiUrl}/start`);
    }

    getLinks(title: string): Observable<{ success: boolean; links: string[] }> {
        return this.http.get<{ success: boolean; links: string[] }>(`${this.apiUrl}/links/${encodeURIComponent(title)}`);
    }

    makeMove(gameId: string, newPage: string): Observable<{ success: boolean; game: any }> {
        return this.http.post<{ success: boolean; game: any }>(`${this.apiUrl}/move`, {
            gameId,
            newPage
        });
    }

    abandonGame(gameId: string): Observable<{ success: boolean }> {
        return this.http.post<{ success: boolean }>(`${this.apiUrl}/abandon`, { gameId });
    }

    getLeaderboard(): Observable<{ success: boolean; leaderboard: any[] }> {
        return this.http.get<{ success: boolean; leaderboard: any[] }>(`${this.apiUrl}/leaderboard`);
    }

    getRecentGames(): Observable<{ success: boolean; games: any[] }> {
        return this.http.get<{ success: boolean; games: any[] }>(`${this.apiUrl}/recent`);
    }
}
