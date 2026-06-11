import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { GameService } from './services/game';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'RoadToUnina';

  currentGame = signal<any | null>(null);
  currentLinks = signal<string[]>([]);
  error = signal<string>('');

  isLoggedIn = signal<boolean>(false);
  usernameInput = signal<string>('');
  passwordInput = signal<string>('');
  currentMode = signal<'welcome' | 'login' | 'register' | 'play'>('welcome');

  elapsedTimeSeconds = signal<number>(0);

  constructor() {
    effect((onCleanup) => {
      const game = this.currentGame();
      if (game && game.status === 'playing') {
        const calculateTime = () => {
          this.elapsedTimeSeconds.set(Math.floor((Date.now() - game.start_time) / 1000));
        };
        calculateTime(); // initial calculation
        const intervalId = setInterval(calculateTime, 1000);
        
        onCleanup(() => {
          clearInterval(intervalId);
        });
      }
    });
  }
  
  showLeaderboard = signal<boolean>(false);
  leaderboardData = signal<any[]>([]);
  recentGames = signal<any[]>([]);

  searchTerm = signal<string>('');

  groupedLinks = computed(() => {
    const links = this.currentLinks();
    const term = this.searchTerm().toLowerCase();
    const filteredLinks = term ? links.filter(link => link.toLowerCase().includes(term)) : links;
    
    const groups: { [key: string]: string[] } = {};
    for (const link of filteredLinks) {
      const initial = link.charAt(0).toUpperCase();
      const letter = /[A-Z]/.test(initial) ? initial : '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(link);
    }
    return Object.keys(groups).sort().map(key => ({
      letter: key,
      links: groups[key]
    }));
  });

  private gameService = inject(GameService);
  private authService = inject(AuthService);

  currentUsername = computed(() => this.isLoggedIn() ? this.authService.getUsername() : '');

  ngOnInit() {
    this.isLoggedIn.set(this.authService.isLoggedIn());
    if (this.isLoggedIn()) {
      this.currentMode.set('play');
      this.loadCurrentGame();
    } else {
      this.loadRecentGames();
    }
  }

  loadCurrentGame() {
    this.gameService.getCurrentGame().subscribe({
      next: (res) => {
        if (res.success && res.game) {
          this.currentGame.set(res.game);
          if (res.game.status === 'playing') {
            this.fetchLinks(res.game.current_page);
          }
        }
      },
      error: (err) => {
        console.error('Errore nel caricamento della partita corrente', err);
        this.error.set(err.error?.message || 'Errore nel caricamento della partita corrente');
      }
    });
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

  toggleRegister() {
    this.currentMode.set(this.currentMode() === 'register' ? 'login' : 'register');
    this.error.set('');
  }

  setMode(mode: 'welcome' | 'login' | 'register' | 'play') {
    this.currentMode.set(mode);
    this.error.set('');
  }

  goHome() {
    this.setMode('welcome');
    this.loadRecentGames();
  }

  playAction() {
    if (this.isLoggedIn()) {
      this.setMode('play');
    } else {
      this.setMode('login');
    }
  }

  submitAuth() {
    if (!this.usernameInput() || !this.passwordInput()) {
      this.error.set('Inserisci username e password');
      return;
    }

    this.error.set('');
    
    if (this.currentMode() === 'register') {
      this.authService.register(this.usernameInput(), this.passwordInput()).subscribe({
        next: (res) => {
          if (res.success) {
            this.isLoggedIn.set(true);
            this.setMode('play');
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
            this.isLoggedIn.set(true);
            this.setMode('play');
            if (res.activeGame) {
              this.currentGame.set(res.activeGame);
              if (res.activeGame.status === 'playing') {
                this.fetchLinks(res.activeGame.current_page);
              }
            }
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

  logout() {
    this.authService.logout();
    this.isLoggedIn.set(false);
    this.currentGame.set(null);
    this.currentLinks.set([]);
    this.usernameInput.set('');
    this.passwordInput.set('');
    this.setMode('welcome');
    this.loadRecentGames();
  }

  startNewGame() {
    this.error.set('');
    this.currentLinks.set([]);
    this.gameService.startGame().subscribe({
      next: (response) => {
        if (response.success) {
          this.currentGame.set(response.game);
          this.fetchLinks(response.game.current_page);
        } else {
          this.error.set('Impossibile avviare la partita');
        }
      },
      error: (err) => {
        console.error('Errore:', err);
        this.error.set(err.error?.message || 'Errore di connessione al server');
      }
    });
  }

  fetchLinks(title: string) {
    this.gameService.getLinks(title).subscribe({
      next: (response) => {
        if (response.success) {
          this.currentLinks.set(response.links);
        }
      },
      error: (err) => {
        console.error('Errore link:', err);
        this.error.set(err.error?.message || 'Impossibile recuperare i link');
      }
    });
  }

  goToPage(pageTitle: string) {
    const game = this.currentGame();
    if (!game) return;

    // Inizia il caricamento per il passaggio alla pagina successiva
    this.error.set('');
    this.currentLinks.set([]); // Svuotiamo i link vecchi per evitare click doppi
    this.searchTerm.set(''); // Svuota la barra di ricerca

    this.gameService.makeMove(game.id, pageTitle).subscribe({
      next: (response) => {
        if (response.success) {
          // 1. Aggiorniamo la partita con i nuovi dati (passi aumentati, pagina cambiata)
          this.currentGame.set(response.game);
          
          // 2. Se abbiamo vinto, ci fermiamo. Altrimenti, cerchiamo i nuovi link!
          if (response.game.status === 'won') {
          } else {
            this.fetchLinks(response.game.current_page);
          }
        } else {
          this.error.set('Impossibile registrare la mossa');
        }
      },
      error: (err) => {
        console.error('Errore mossa:', err);
        this.error.set(err.error?.message || 'Errore di connessione al server durante la mossa');
      }
    });
  }

  closeGame() {
    this.currentGame.set(null);
    this.currentLinks.set([]);
  }

  abandonGame() {
    const game = this.currentGame();
    if (!game) return;
    this.gameService.abandonGame(game.id).subscribe({
      next: () => {
        this.currentGame.set(null);
        this.currentLinks.set([]);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Impossibile abbandonare la partita');
      }
    });
  }
}
