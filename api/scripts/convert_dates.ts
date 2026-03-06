/**
 * Converts existing ISO strings or date strings in REF_Procedimentos and REF_Operadoras
 * to the format YYYY-MM-DD HH:mm:ss.
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheetsClient } from '../lib/google';

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

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

async function run() {
    const sheets = getGoogleSheetsClient();

    // 1. Fix REF_Procedimentos
    // Cols: procedimento | valor | status | data_insercao | data_atualizacao | valores_anteriores
    console.log('\n=== Converting dates in REF_Procedimentos ===');
    const resP = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'REF_Procedimentos!A:F',
    });
    const rowsP = resP.data.values || [];
    if (rowsP.length > 1) {
        const fixedP = rowsP.slice(1).map(r => {
            const di = r[3] ? new Date(r[3]) : null;
            const da = r[4] ? new Date(r[4]) : null;
            return [
                r[0], r[1], r[2],
                di && !isNaN(di.getTime()) ? formatDate(di) : r[3],
                da && !isNaN(da.getTime()) ? formatDate(da) : r[4],
                r[5]
            ];
        });
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'REF_Procedimentos!A2',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: fixedP },
        });
        console.log(`  ✓ Converted ${fixedP.length} rows`);
    }

    // 2. Fix REF_Operadoras
    // Cols: operadora | status | data_insercao | data_atualizacao | valores_anteriores
    console.log('\n=== Converting dates in REF_Operadoras ===');
    const resO = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'REF_Operadoras!A:E',
    });
    const rowsO = resO.data.values || [];
    if (rowsO.length > 1) {
        const fixedO = rowsO.slice(1).map(r => {
            const di = r[2] ? new Date(r[2]) : null;
            const da = r[3] ? new Date(r[3]) : null;
            return [
                r[0], r[1],
                di && !isNaN(di.getTime()) ? formatDate(di) : r[2],
                da && !isNaN(da.getTime()) ? formatDate(da) : r[3],
                r[4]
            ];
        });
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'REF_Operadoras!A2',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: fixedO },
        });
        console.log(`  ✓ Converted ${fixedO.length} rows`);
    }

    console.log('\n=== DATE CONVERSION COMPLETE ===');
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
