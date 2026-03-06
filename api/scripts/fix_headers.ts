/**
 * Fix header rows in REF_Procedimentos and REF_Operadoras.
 * The migration accidentally used the first data row as the header.
 * This script inserts a proper header row at the top.
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheetsClient } from '../lib/google';

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

async function run() {
    const sheets = getGoogleSheetsClient();

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetIdMap: Record<string, number> = {};
    for (const s of meta.data.sheets || []) {
        const title = s.properties?.title;
        const id = s.properties?.sheetId;
        if (title != null && id != null) sheetIdMap[title] = id;
    }

    // Fix REF_Procedimentos: should have header: procedimento, data_criacao, valor, status_ativo, data_insercao, status, data_ultima_modificacao, valores_anteriores
    // Fix REF_Operadoras: should have header: operadora, data_insercao, status, data_ultima_modificacao, valores_anteriores

    const sheetsToFix = [
        {
            name: 'REF_Procedimentos',
            header: ['procedimento', 'data_criacao', 'valor', 'status_ativo', 'data_insercao', 'status', 'data_ultima_modificacao', 'valores_anteriores'],
        },
        {
            name: 'REF_Operadoras',
            header: ['operadora', 'data_insercao', 'status', 'data_ultima_modificacao', 'valores_anteriores'],
        },
    ];

    const today = new Date().toISOString().split('T')[0];

    for (const { name, header } of sheetsToFix) {
        console.log(`\nFixing: ${name}`);

        const result = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${name}!A:Z`,
        });
        const rows = result.data.values || [];
        if (rows.length === 0) { console.log('  Empty sheet, adding header only.'); }

        // Check if the first row already looks like a proper header
        const firstRow = rows[0] || [];
        const isAlreadyHeader = String(firstRow[0]).toLowerCase() === header[0].toLowerCase();

        if (isAlreadyHeader) {
            console.log('  Header already correct, skipping.');
            continue;
        }

        console.log(`  Current first row: [${firstRow.slice(0, 3).join(', ')}...]`);
        console.log(`  Will insert header: [${header.join(', ')}]`);

        // The first row is data (got promoted because there was no header before).
        // Insert a new row at the top with proper header.
        const sheetId = sheetIdMap[name];
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{
                    insertDimension: {
                        range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
                        inheritFromBefore: false,
                    },
                }],
            },
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${name}!A1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [header] },
        });

        // Also backfill missing audit column values for the existing data rows (now row 2 onwards)
        // Re-read to see how many data rows there are
        const result2 = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${name}!A:Z`,
        });
        const rows2 = result2.data.values || [];
        const headerLen = header.length;

        // For each data row, pad and fill default audit values
        const updatedRows = rows2.slice(1).map((row: any[]) => {
            const padded = [...row];
            while (padded.length < headerLen) {
                const colIndex = padded.length;
                const colName = header[colIndex];
                if (colName === 'data_insercao') padded.push(today);
                else if (colName === 'status') padded.push(String(padded[3] || 'Ativo')); // use existing status_ativo if present
                else if (colName === 'data_ultima_modificacao') padded.push(today);
                else if (colName === 'valores_anteriores') padded.push('');
                else padded.push('');
            }
            return padded;
        });

        if (updatedRows.length > 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${name}!A2`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: updatedRows },
            });
        }

        console.log(`  ✓ Fixed ${name}: inserted header, ${updatedRows.length} data rows updated.`);
    }

    console.log('\n=== HEADER FIX COMPLETE ===');
}

run().catch(e => { console.error('FIX FAILED:', e.message ?? e); process.exit(1); });
