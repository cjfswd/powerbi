import { getGoogleSheetsClient } from './lib/google';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    if (!spreadsheetId) {
        return res.status(500).json({ error: 'Missing GOOGLE_SHEETS_ID environment variable' });
    }

    try {
        const { patients } = req.body;

        if (!patients || !Array.isArray(patients) || patients.length === 0) {
            return res.status(400).json({ error: 'Payload must contain a "patients" array' });
        }

        const sheets = getGoogleSheetsClient();

        // Convert array of objects to array of arrays (rows)
        // sheet format: id, nome, municipio, nasc, sexo, oper, acom, status, pacote, entrada, saida
        const rows = patients.map((p: any) => [
            p.id || '',
            p.nome || '',
            p.municipio || '',
            p.nasc || '',
            p.sexo || '',
            p.operadora || '',
            p.acomodacao || '',
            p.status || 'Ativo',
            p.pacote || '',
            p.entrada || '',
            p.saida || ''
        ]);

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Pacientes!A:K',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: rows,
            },
        });

        return res.status(200).json({
            success: true,
            updates: response.data.updates
        });
    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
