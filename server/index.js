import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/db.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', routes);
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);
connectDatabase().then(() => app.listen(port, () => console.log(`BookMyMovie API listening on ${port}`))).catch((error) => { console.error(error); process.exit(1); });
