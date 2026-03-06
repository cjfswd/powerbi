/**
 * Standardizes headers across REF sheets.
 * Final schema:
 *   REF_Procedimentos: procedimento | valor | status | data_insercao | data_atualizacao | valores_anteriores
 *   REF_Operadoras:    operadora    | status | data_insercao | data_atualizacao | valores_anteriores
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheetsClient } from '../lib/google';

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;
const today = new Date().toISOString().split('T')[0];

async function run() {
    const sheets = getGoogleSheetsClient();

    // ─── REF_Procedimentos ───────────────────────────────────────────────────
    // Old cols: procedimento, data_criacao, valor, status_ativo, data_insercao, status, data_ultima_modificacao, valores_anteriores
    // New cols: procedimento, valor, status, data_insercao, data_atualizacao, valores_anteriores
    {
        const name = 'REF_Procedimentos';
        console.log(`\n=== ${name} ===`);
        const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${name}!A:H` });
        const rows: any[][] = res.data.values || [];

        const newHeader = ['procedimento', 'valor', 'status', 'data_insercao', 'data_atualizacao', 'valores_anteriores'];

        // Map old rows → new schema
        // old[0]=procedimento, old[1]=data_criacao(ignore/use as data_insercao fallback), old[2]=valor,
        // old[3]=status_ativo, old[4]=data_insercao, old[5]=status, old[6]=data_ultima_modificacao, old[7]=valores_anteriores
        const newData = rows.slice(1).map((r: any[]) => [
            r[0] || '',                                                 // procedimento
            r[2] || '',                                                 // valor (was col C)
            r[5] || r[3] || 'Ativo',                                   // status (prefer new col, fallback to status_ativo)
            r[4] || r[1] || today,                                      // data_insercao
            r[6] || today,                                              // data_atualizacao
            r[7] || '',                                                 // valores_anteriores
        ]);

        await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${name}!A:Z` });
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${name}!A1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [newHeader, ...newData] },
        });

        console.log(`  ✓ Rewritten with ${newData.length} data rows`);
        console.log(`  Header: [${newHeader.join(', ')}]`);
        newData.forEach((r, i) => console.log(`  [${i + 1}]: ${r[0]?.substring(0, 40)} | valor=${r[1]} | status=${r[2]}`));
    }

    // ─── REF_Operadoras ──────────────────────────────────────────────────────
    // Old cols: operadora, data_insercao, status, data_ultima_modificacao, valores_anteriores
    // New cols: operadora, status, data_insercao, data_atualizacao, valores_anteriores
    {
        const name = 'REF_Operadoras';
        console.log(`\n=== ${name} ===`);
        const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${name}!A:E` });
        const rows: any[][] = res.data.values || [];

        const newHeader = ['operadora', 'status', 'data_insercao', 'data_atualizacao', 'valores_anteriores'];

        // old[0]=operadora, old[1]=data_insercao, old[2]=status, old[3]=data_ultima_modificacao, old[4]=valores_anteriores
        const newData = rows.slice(1).map((r: any[]) => [
            r[0] || '',        // operadora
            r[2] || 'Ativo',   // status
            r[1] || today,     // data_insercao
            r[3] || today,     // data_atualizacao
            r[4] || '',        // valores_anteriores
        ]);

        await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${name}!A:E` });
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${name}!A1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [newHeader, ...newData] },
        });

        console.log(`  ✓ Rewritten with ${newData.length} data rows`);
        console.log(`  Header: [${newHeader.join(', ')}]`);
        newData.forEach((r, i) => console.log(`  [${i + 1}]: ${r[0]} | status=${r[1]}`));
    }

    console.log('\n=== STANDARDIZATION COMPLETE ===');
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
