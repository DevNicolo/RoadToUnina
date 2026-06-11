import { Component, OnInit, signal, inject, effect, ViewEncapsulation } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { GameService } from './services/game';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None
})
export class App implements OnInit {
  private gameService = inject(GameService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = signal<boolean>(false);
  showLeaderboard = signal<boolean>(false);
  leaderboardData = signal<any[]>([]);

  constructor() {
    effect(() => {
      // Sync the signal with the auth service status automatically
      // Note: non-reactive in effect, but we can subscribe instead.
      // Wait, we can't use an effect on a BehaviorSubject directly unless we use toSignal.
    });
  }

  ngOnInit() {
    this.authService.authStatus.subscribe(status => {
      this.isLoggedIn.set(status);
    });
  }

  goHome() {
    this.router.navigate(['/welcome']);
  }

  openLeaderboard() {
    this.gameService.getLeaderboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.leaderboardData.set(res.leaderboard);
          this.showLeaderboard.set(true);
        }
      },
      error: (err) => console.error('Errore nel caricamento della classifica', err)
    });
  }

  closeLeaderboard() {
    this.showLeaderboard.set(false);
  }

  setMode(mode: string) {
    this.router.navigate(['/' + mode]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/welcome']);
  }
}
