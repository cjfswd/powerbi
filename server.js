import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import handler from './api/sheets.ts';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(cors());

// Parse API module using node instead
app.get('/api/sheets', async (req, res) => {
    return await handler(req, res);
});


const PORT = 3001;
const server = app.listen(PORT, () => {
    console.log(`Mock Vercel API listening at http://localhost:${PORT}`);
});

// Keep process alive
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Process terminated');
    });
});
