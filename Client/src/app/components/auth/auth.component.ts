import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isRegister = signal<boolean>(false);
  usernameInput = signal<string>('');
  passwordInput = signal<string>('');
  error = signal<string>('');

  ngOnInit() {
    this.route.url.subscribe(url => {
      this.isRegister.set(url[0].path === 'register');
    });
  }

  toggleRegister() {
    this.isRegister.set(!this.isRegister());
    this.router.navigate([this.isRegister() ? '/register' : '/login']);
    this.error.set('');
  }

  submitAuth() {
    if (!this.usernameInput() || !this.passwordInput()) {
      this.error.set('Inserisci username e password');
      return;
    }

    this.error.set('');
    
    if (this.isRegister()) {
      this.authService.register(this.usernameInput(), this.passwordInput()).subscribe({
        next: (res) => {
          if (res.success) {
            this.router.navigate(['/play']);
          } else {
            this.error.set(res.message || 'Errore durante la registrazione');
          }
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Errore di connessione al server');
        }
      });
    } else {
      this.authService.login(this.usernameInput(), this.passwordInput()).subscribe({
        next: (res) => {
          if (res.success) {
            this.router.navigate(['/play']);
          } else {
            this.error.set(res.message || 'Errore durante il login');
          }
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Errore di connessione al server');
        }
      });
    }
  }
}
