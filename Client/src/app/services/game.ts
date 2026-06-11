import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class GameService {
    private apiUrl = 'http://192.168.1.235:3000/api/game';
    private http = inject(HttpClient);

    private getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            headers: new HttpHeaders({
                'Authorization': `Bearer ${token}`
            })
        };
    }

    // Metodo per recuperare la partita corrente
    getCurrentGame(): Observable<{ success: boolean; game: any }> {
        return this.http.get<{ success: boolean; game: any }>(`${this.apiUrl}/current`, this.getAuthHeaders());
    }

    // Metodo per chiamare il nostro server Node.js e iniziare la partita
    startGame(): Observable<{ success: boolean; game: any }> {
        return this.http.get<{ success: boolean; game: any }>(`${this.apiUrl}/start`, this.getAuthHeaders());
    }

    // Metodo per recuperare i link di una pagina
    getLinks(title: string): Observable<{ success: boolean; links: string[] }> {
        return this.http.get<{ success: boolean; links: string[] }>(`${this.apiUrl}/links/${encodeURIComponent(title)}`, this.getAuthHeaders());
    }

    // Metodo per registrare la mossa
    makeMove(gameId: string, newPage: string): Observable<{ success: boolean; game: any }> {
        return this.http.post<{ success: boolean; game: any }>(`${this.apiUrl}/move`, {
            gameId,
            newPage
        }, this.getAuthHeaders());
    }

    // Metodo per abbandonare la partita
    abandonGame(gameId: string): Observable<{ success: boolean }> {
        return this.http.post<{ success: boolean }>(`${this.apiUrl}/abandon`, { gameId }, this.getAuthHeaders());
    }

    // Metodi
    getLeaderboard(): Observable<{ success: boolean; leaderboard: any[] }> {
        return this.http.get<{ success: boolean; leaderboard: any[] }>(`${this.apiUrl}/leaderboard`, this.getAuthHeaders());
    }

    getRecentGames(): Observable<{ success: boolean; games: any[] }> {
        return this.http.get<{ success: boolean; games: any[] }>(`${this.apiUrl}/recent`);
    }
}
