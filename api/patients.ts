import { getGoogleSheetsClient } from './lib/google.ts';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST' && req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    if (!spreadsheetId) {
        return res.status(500).json({ error: 'Missing GOOGLE_SHEETS_ID environment variable' });
    }

    try {
        const { action = 'insert', patients, patient } = req.body;
        const sheets = getGoogleSheetsClient();

        if (action === 'insert') {
            if (!patients || !Array.isArray(patients) || patients.length === 0) {
                return res.status(400).json({ error: 'Payload must contain a "patients" array' });
            }

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
                requestBody: { values: rows },
            });

            return res.status(200).json({ success: true, updates: response.data.updates });
        }

        if (action === 'update') {
            if (!patient || !patient.id) {
                return res.status(400).json({ error: 'Missing patient object with an id' });
            }

            // Find the row index for this patient
            const result = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'Pacientes!A:A',
            });
            const rows = result.data.values || [];

            // rows is an array of arrays, e.g. [['ID'], ['123'], ['124']]
            // Find row index (1-based for A1 notation), skip header row at index 0
            const rowIndex = rows.findIndex((row: any[], i: number) => {
                if (i === 0 || !row[0]) return false;
                return String(row[0]).trim() === String(patient.id).trim();
            }) + 1;

            if (rowIndex === 0) {
                return res.status(404).json({ error: 'Patient not found' });
            }

            const updateRow = [
                patient.id || '',
                patient.nome || '',
                patient.municipio || '',
                patient.nasc || '',
                patient.sexo || '',
                patient.operadora || '',
                patient.acomodacao || '',
                patient.status || 'Ativo',
                patient.pacote || '',
                patient.entrada || '',
                patient.saida || ''
            ];

            const response = await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `Pacientes!A${rowIndex}:K${rowIndex}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [updateRow] }
            });

            return res.status(200).json({ success: true, updates: response.data });
        }

        return res.status(400).json({ error: 'Invalid action' });
    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
