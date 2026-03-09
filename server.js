import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sheetsHandler from './api/sheets.ts';
import procedimentosHandler from './api/procedimentos.ts';
import patientsHandler from './api/patients.ts';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

// Parse API module using node instead
app.all('/api/sheets', async (req, res) => {
    return await sheetsHandler(req, res);
});

app.all('/api/procedimentos', async (req, res) => {
    return await procedimentosHandler(req, res);
});

app.all('/api/patients', async (req, res) => {
    return await patientsHandler(req, res);
});


const PORT = 3006;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mock Vercel API listening at http://0.0.0.0:${PORT}`);
});

server.on('error', (err) => {
    console.error('SERVER ERROR:', err);
});

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

// Periodic log to confirm it's alive
setInterval(() => {
    // console.log('Server still alive on port ' + PORT);
}, 30000);

// Keep process alive
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Process terminated');
    });
});
