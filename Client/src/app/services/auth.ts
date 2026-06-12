import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = environment.apiUrl;
    private http = inject(HttpClient);

    authStatus = new BehaviorSubject<boolean>(this.hasToken());

    private hasToken(): boolean {
        return !!localStorage.getItem('token');
    }

    register(username: string, password: string): Observable<{ success: boolean; message: string; token?: string }> {
        return this.http.post<{ success: boolean; message: string; token?: string }>(`${this.apiUrl}/register`, { username, password })
            .pipe(tap(res => {
                if (res.success && res.token) {
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('username', username);
                    this.authStatus.next(true);
                }
            }));
    }

    login(username: string, password: string): Observable<{ success: boolean; message: string; token?: string; activeGame?: any }> {
        return this.http.post<{ success: boolean; message: string; token?: string; activeGame?: any }>(`${this.apiUrl}/login`, { username, password })
            .pipe(tap(res => {
                if (res.success && res.token) {
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('username', username);
                    this.authStatus.next(true);
                }
            }));
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        this.authStatus.next(false);
    }

    isLoggedIn(): boolean {
        return this.authStatus.value;
    }

    getUsername(): string | null {
        return localStorage.getItem('username');
    }
}
