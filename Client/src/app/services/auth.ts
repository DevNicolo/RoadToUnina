import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = 'http://192.168.1.235:3000/api';
    private http = inject(HttpClient);

    register(username: string, password: string): Observable<{ success: boolean; message: string; token?: string }> {
        return this.http.post<{ success: boolean; message: string; token?: string }>(`${this.apiUrl}/register`, { username, password })
            .pipe(tap(res => {
                if (res.success && res.token) {
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('username', username);
                }
            }));
    }

    login(username: string, password: string): Observable<{ success: boolean; message: string; token?: string; activeGame?: any }> {
        return this.http.post<{ success: boolean; message: string; token?: string; activeGame?: any }>(`${this.apiUrl}/login`, { username, password })
            .pipe(tap(res => {
                if (res.success && res.token) {
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('username', username);
                }
            }));
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    getUsername(): string | null {
        return localStorage.getItem('username');
    }
}
