import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.component.html'
})
export class WelcomeComponent implements OnInit {
  private gameService = inject(GameService);
  private authService = inject(AuthService);
  private router = inject(Router);

  recentGames = signal<any[]>([]);
  isLoggedIn = signal<boolean>(false);

  ngOnInit() {
    this.isLoggedIn.set(this.authService.isLoggedIn());
    this.loadRecentGames();
  }

  loadRecentGames() {
    this.gameService.getRecentGames().subscribe({
      next: (res) => {
        if (res.success) {
          this.recentGames.set(res.games);
        }
      },
      error: (err) => console.error('Errore nel caricamento delle partite recenti', err)
    });
  }

  playAction() {
    if (this.isLoggedIn()) {
      this.router.navigate(['/play']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
