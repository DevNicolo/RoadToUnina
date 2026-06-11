import express from 'express';
import cors from 'cors';

// Importazione dei nostri file di routing!
import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';

const app = express();
const PORT = 3000;

// Configurazione base
app.use(cors());
app.use(express.json());

// Registrazione delle rotte principali dell'applicazione
app.use('/api', authRoutes);         // Risponderà a /api/login e /api/register
app.use('/api/game', gameRoutes);    // Risponderà a /api/game/start, /api/game/move

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server in esecuzione su http://localhost:${PORT}`);
});