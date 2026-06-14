import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/game', gameRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`http://localhost:${PORT}`);
});