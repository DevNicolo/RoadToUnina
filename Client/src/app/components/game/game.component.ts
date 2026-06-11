import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  private gameService = inject(GameService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUsername = computed(() => this.authService.getUsername() || '');
  
  currentGame = signal<any | null>(null);
  currentLinks = signal<string[]>([]);
  error = signal<string>('');
  searchTerm = signal<string>('');
  isLoadingLinks = signal<boolean>(false);
  
  elapsedTimeSeconds = signal<number>(0);

  groupedLinks = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const links = this.currentLinks().filter(link => link.toLowerCase().includes(term));
    const groups: { letter: string, links: string[] }[] = [];
    
    links.forEach(link => {
      const firstLetter = link.charAt(0).toUpperCase();
      let group = groups.find(g => g.letter === firstLetter);
      if (!group) {
        group = { letter: firstLetter, links: [] };
        groups.push(group);
      }
      group.links.push(link);
    });
    
    return groups.sort((a, b) => a.letter.localeCompare(b.letter));
  });

  constructor() {
    effect((onCleanup) => {
      const game = this.currentGame();
      if (game && game.status === 'playing') {
        const calculateTime = () => {
          this.elapsedTimeSeconds.set(Math.floor((Date.now() - game.start_time) / 1000));
        };
        calculateTime();
        const intervalId = setInterval(calculateTime, 1000);
        onCleanup(() => clearInterval(intervalId));
      }
    });
  }

  ngOnInit() {
    this.loadCurrentGame();
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
    this.isLoadingLinks.set(true);
    this.gameService.getLinks(title).subscribe({
      next: (response) => {
        this.isLoadingLinks.set(false);
        if (response.success) {
          this.currentLinks.set(response.links);
        }
      },
      error: (err) => {
        this.isLoadingLinks.set(false);
        console.error('Errore link:', err);
        this.error.set(err.error?.message || 'Impossibile recuperare i link');
      }
    });
  }

  goToPage(pageTitle: string) {
    const game = this.currentGame();
    if (!game) return;

    this.error.set('');
    this.currentLinks.set([]);
    this.searchTerm.set('');

    this.gameService.makeMove(game.id, pageTitle).subscribe({
      next: (response) => {
        if (response.success) {
          this.currentGame.set(response.game);
          if (response.game.status !== 'won') {
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
    this.router.navigate(['/welcome']);
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
