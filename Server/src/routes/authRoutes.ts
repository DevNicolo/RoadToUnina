import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middlewares/auth';
import db from '../database/postgres';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Username e password sono richiesti' });
      return;
    }

    const existingUser = await db.findUserByUsername(username);
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Username già in uso' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await db.createUser(username, passwordHash);
    const token = generateToken({ userId: newUser.id, username: newUser.username });

    res.status(201).json({ success: true, message: 'Utente registrato con successo', token });
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    res.status(500).json({ success: false, message: 'Errore interno del server' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Username e password sono richiesti' });
      return;
    }

    const user = await db.findUserByUsername(username);
    if (!user) {
      res.status(401).json({ success: false, message: 'Credenziali non valide' });
      return;
    }
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Credenziali non valide' });
      return;
    }

    const token = generateToken({ userId: user.id, username: user.username });
    
    // Cerca se c'è una partita in corso per l'utente
    const activeGame = await db.findActiveGameSession(user.id);

    res.json({ 
      success: true, 
      message: 'Login effettuato con successo', 
      token,
      activeGame: activeGame || null
    });
  } catch (error) {
    console.error('Errore durante il login:', error);
    res.status(500).json({ success: false, message: 'Errore interno del server' });
  }
});

export default router;
