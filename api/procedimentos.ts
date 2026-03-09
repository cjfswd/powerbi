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
        const { action, payload } = req.body;
        const sheets = getGoogleSheetsClient();

        const formatDate = (date: Date) => {
            const pad = (n: number) => n.toString().padStart(2, '0');
            const y = date.getFullYear();
            const m = pad(date.getMonth() + 1);
            const d = pad(date.getDate());
            const h = pad(date.getHours());
            const mi = pad(date.getMinutes());
            const s = pad(date.getSeconds());
            return `${y}-${m}-${d} ${h}:${mi}:${s}`;
        };

        if (action === 'insert_reference' || action === 'batch_insert_reference') {
            // payload: single object { procedimento, precoCusto, precoVenda, ativo }
            // or array of such objects
            const list = Array.isArray(payload) ? payload : [payload];
            
            const now = formatDate(new Date());
            const rows: any[][] = [];
            for (const item of list) {
                if (!item.procedimento || item.precoCusto === undefined || item.precoVenda === undefined) {
                    return res.status(400).json({ error: 'Missing procedimento, precoCusto or precoVenda' });
                }
                const status = item.ativo === false ? 'Inativo' : 'Ativo';
                rows.push([
                    item.procedimento,
                    item.precoCusto,
                    item.precoVenda,
                    status,
                    now,   // data_insercao
                    now,   // data_atualizacao
                    '',    // valores_anteriores
                ]);
            }

            const response = await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: 'REF_Procedimentos!A:G',
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                requestBody: { values: rows },
            });

            return res.status(200).json({ success: true, updates: response.data.updates });
        }

        if (action === 'update_reference') {
            // payload: { procedimento, precoCusto, precoVenda, ativo }
            // Schema: procedimento | preco_custo | preco_venda | status | data_insercao | data_atualizacao | valores_anteriores
            if (!payload.procedimento || payload.precoCusto === undefined || payload.precoVenda === undefined) {
                return res.status(400).json({ error: 'Missing procedimento, precoCusto or precoVenda' });
            }

            const result = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'REF_Procedimentos!A:G',
            });
            const rows = result.data.values || [];

            // Find row index (skip header at index 0)
            const rowIndex = rows.findIndex((row: any[], i: number) => {
                if (i === 0 || !row[0]) return false;
                return String(row[0]).trim() === String(payload.procedimento).trim();
            }) + 1;
            if (rowIndex === 0) {
                return res.status(404).json({ error: 'Procedimento not found' });
            }

            const existingRow = rows[rowIndex - 1] || [];
            const status = payload.ativo === false ? 'Inativo' : 'Ativo';
            const now = formatDate(new Date());

            // valores_anteriores: snapshot of the full row before this update (JSON array)
            const valoresAnteriores = JSON.stringify({
                procedimento: existingRow[0] || '',
                preco_custo: existingRow[1] || '',
                preco_venda: existingRow[2] || '',
                status: existingRow[3] || '',
                data_insercao: existingRow[4] || '',
                data_atualizacao: existingRow[5] || '',
            });

            const updateRow = [
                payload.procedimento,
                payload.precoCusto,
                payload.precoVenda,
                status,
                existingRow[4] || now,  // data_insercao (preserve original)
                now,                    // data_atualizacao (refreshed)
                valoresAnteriores,      // valores_anteriores
            ];

            const response = await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `REF_Procedimentos!A${rowIndex}:G${rowIndex}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [updateRow] },
            });

            return res.status(200).json({ success: true, updates: response.data });
        }

        if (action === 'batch_insert_realizados') {
            // payload: { month, year, procedimentos: [{ paciente_id, proc, qtd, custo_unit, venda_unit, custo_total, venda_total }] }
            // This allows the frontend to send the pre-calculated units
            // based on the historical `Ref_Procedimentos` table.
            if (!payload.procedimentos || !Array.isArray(payload.procedimentos)) {
                return res.status(400).json({ error: 'Missing procedimentos array' });
            }

            // sheet format: id, paciente_id, proc, mes, ano, qtd, custo_unit, venda_unit, custo_total, venda_total, valor_glosado
            const rows = payload.procedimentos.map((p: any) => [
                p.id || '', // can be generated by sheets formula or empty
                p.paciente_id || '',
                p.proc || '',
                payload.month || '',
                payload.year || '',
                p.qtd || 1,
                p.custo_unit || 0,
                p.venda_unit || 0,
                p.custo_total || 0,
                p.venda_total || 0,
                p.valor_glosado || 0
            ]);

            const response = await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: 'Procedimentos_Realizados!A:K',
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                requestBody: { values: rows },
            });

            return res.status(200).json({ success: true, updates: response.data.updates });
        }

        return res.status(400).json({ error: 'Invalid action' });
    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
