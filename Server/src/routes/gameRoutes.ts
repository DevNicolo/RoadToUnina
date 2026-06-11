import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../middlewares/auth';
import db from '../database/postgres';

const router = Router();

// Endpoint per la cronologia (Pubblico, ultime 100 partite)
router.get('/recent', async (req: Request, res: Response): Promise<void> => {
  try {
    const recentGames = await db.getRecentGames();
    res.json({ success: true, games: recentGames });
  } catch (error) {
    console.error('Errore nel recupero cronologia:', error);
    res.status(500).json({ success: false, message: 'Errore interno del server' });
  }
});

// Rotte protette da autenticazione JWT
router.use(authenticateJWT);

// Endpoint per la classifica (Privato)
router.get('/leaderboard', async (req: Request, res: Response): Promise<void> => {
  try {
    const leaderboard = await db.getLeaderboard();
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Errore nel recupero della classifica:', error);
    res.status(500).json({ success: false, message: 'Errore interno del server' });
  }
});

// Endpoint per recuperare la partita in corso
router.get('/current', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user.userId;
    const activeGame = await db.findActiveGameSession(userId);

    if (activeGame) {
      res.json({ success: true, game: activeGame });
    } else {
      res.json({ success: true, game: null, message: 'Nessuna partita in corso' });
    }
  } catch (error) {
    console.error('Errore nel recupero della partita:', error);
    res.status(500).json({ success: false, message: 'Errore interno del server' });
  }
});

// Endpoint per avviare la partita (sarà mimetizzato sotto /api/game)
router.get('/start', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user.userId;

    const wikiUrl = 'https://it.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnfilterredir=nonredirects&format=json';
    const response = await fetch(wikiUrl, {
      headers: {
        'User-Agent': 'RoadToUninaApp/1.0' 
      }
    });
    const data = await response.json();
    const randomPage = data.query.random[0].title;
    
    const targetPage = 'Università degli Studi di Napoli Federico II';
    const startTime = Date.now();

    const newGame = await db.createGameSession(userId, randomPage, targetPage, [randomPage], startTime);
    
    res.json({ success: true, game: newGame });

  } catch (error) {
    console.error('Errore:', error);
    res.status(500).json({ success: false, message: 'Errore interno del server' });
  }
});

// Endpoint per ottenere i link di una specifica pagina
router.get('/links/:title', async (req: Request, res: Response): Promise<void> => {
  try {
    const title = encodeURIComponent(req.params.title as string);
    
    const wikiUrl = `https://it.wikipedia.org/w/api.php?action=query&titles=${title}&prop=links&pllimit=max&plnamespace=0&format=json`;
    
    const response = await fetch(wikiUrl, {
      headers: {
        'User-Agent': 'RoadToUninaApp/1.0' 
      }
    });
    const data = await response.json();
    
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0]; 
    
    if (!pages[pageId].links) {
      res.json({ success: true, links: [] });
      return;
    }

    const links = pages[pageId].links.map((link: { title: string }) => link.title);
    
    res.json({ success: true, links });

  } catch (error) {
    console.error('Errore nel recupero dei link:', error);
    res.status(500).json({ success: false, message: 'Errore interno del server' });
  }
});

// Endpoint per registrare una mossa
router.post('/move', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user.userId;
    const { gameId, newPage } = req.body;
    
    const game = await db.findGameSession(gameId, userId);

    if (!game) {
      res.status(404).json({ success: false, message: 'Partita non trovata o non autorizzata' });
      return;
    }

    if (game.status !== 'playing') {
      res.status(400).json({ success: false, message: 'La partita è già conclusa' });
      return;
    }

    let newStatus = 'playing';
    if (newPage === game.target_page) {
      newStatus = 'won';
    }

    const updatedGame = await db.updateGameSessionMove(gameId, newPage, newStatus);
    res.json({ success: true, game: updatedGame });

  } catch (error) {
    console.error('Errore durante la mossa:', error);
    res.status(500).json({ success: false, message: 'Errore interno del server' });
  }
});

// Endpoint per abbandonare la partita
router.post('/abandon', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user.userId;
    const { gameId } = req.body;
    await db.abandonGameSession(gameId, userId);
    res.json({ success: true, message: 'Partita abbandonata' });
  } catch (error) {
    console.error('Errore durante abbandono:', error);
    res.status(500).json({ success: false, message: 'Errore interno del server' });
  }
});

export default router;
