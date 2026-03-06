/**
 * Fix: Remove the duplicate header row (row index 1) from REF_Procedimentos and REF_Operadoras,
 * and align data values to the correct columns.
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheetsClient } from '../lib/google';

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

const today = new Date().toISOString().split('T')[0];

async function run() {
    const sheets = getGoogleSheetsClient();

    // Get all sheet IDs
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetIdMap: Record<string, number> = {};
    for (const s of meta.data.sheets || []) {
        const title = s.properties?.title;
        const id = s.properties?.sheetId;
        if (title != null && id != null) sheetIdMap[title] = id;
    }

    // ---- REF_Procedimentos ----
    // Expected header: procedimento, data_criacao, valor, status_ativo, data_insercao, status, data_ultima_modificacao, valores_anteriores
    // Row [1] has audit col names instead of data — delete it, then fix data alignment
    {
        const sheetName = 'REF_Procedimentos';
        const sheetId = sheetIdMap[sheetName];
        console.log(`\n=== Fixing ${sheetName} ===`);

        const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!A:H` });
        const rows: any[][] = res.data.values || [];

        // row[0] = header (correct)
        // row[1] = duplicate/garbage row with audit col names — DELETE
        // rows[2..] = actual data but misaligned
        // The original first procedure row was:
        //   [procedimentoName, 'data_insercao', 'status', 'data_ultima_modificacao', 'valores_anteriores', 'data_ultima_modificacao', '2026-03-05']
        // Real data (second+ rows) are already correct format but missing some columns.

        // Delete row index 1 (the garbage duplicate header)
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId,
                            dimension: 'ROWS',
                            startIndex: 1, // 0-indexed, so row 2 in Sheets UI
                            endIndex: 2,
                        },
                    },
                }],
            },
        });
        console.log('  ✓ Deleted duplicate header row (row 2)');

        // Re-read after deletion
        const res2 = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!A:H` });
        const rows2: any[][] = res2.data.values || [];
        console.log('  Rows after deletion:');
        rows2.forEach((r, i) => console.log(`    [${i}]:`, r.slice(0, 5)));

        // Now fix each data row: the first procedure row (now row index 1) was garbled.
        // Its original columns were: [procedimento_name, 'data_insercao', 'status', 'data_ultima_modificacao', 'valores_anteriores', ...]
        // We need to fix it to: [procedimento_name, data_criacao, valor, status_ativo, data_insercao, status, data_ultima_modificacao, valores_anteriores]
        // The name is preserved in col A. The rest need to be cleaned.
        const fixedRows = rows2.slice(1).map((row: any[], i: number) => {
            const procedimento = String(row[0] || '');
            // Check if the row is garbled (col B contains audit col names, not a date or number)
            const colB = String(row[1] || '');
            const isGarbled = colB === 'data_insercao' || colB === 'data_criacao' || isNaN(Number(colB)) && colB.length < 5;

            if (isGarbled) {
                console.log(`    Row ${i + 1} appears garbled, rebuilding with defaults: ${procedimento.substring(0, 40)}`);
                return [
                    procedimento,
                    today,          // data_criacao
                    '',             // valor (unknown, leave blank)
                    'Ativo',        // status_ativo
                    today,          // data_insercao
                    'Ativo',        // status
                    today,          // data_ultima_modificacao
                    '',             // valores_anteriores
                ];
            }
            // Row already looks correct, just pad to 8 cols
            while (row.length < 8) row.push('');
            return row;
        });

        if (fixedRows.length > 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!A2`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: fixedRows },
            });
            console.log(`  ✓ Fixed ${fixedRows.length} data rows`);
        }
    }

    // ---- REF_Operadoras ----
    // row[0] = header (correct)
    // row[1] = "Unimed NI RJ", 'data_insercao', 'status', 'data_ultima_modificacao', 'valores_anteriores' — garbled
    // row[2] = "CAMPERJ", '2026-03-05', 'Ativo', '2026-03-05' — correct but missing last col
    {
        const sheetName = 'REF_Operadoras';
        const sheetId = sheetIdMap[sheetName];
        console.log(`\n=== Fixing ${sheetName} ===`);

        const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!A:E` });
        const rows: any[][] = res.data.values || [];

        console.log('  Current rows:');
        rows.forEach((r, i) => console.log(`    [${i}]:`, r));

        // Fix each data row
        const fixedRows = rows.slice(1).map((row: any[], i: number) => {
            const operadora = String(row[0] || '');
            const colB = String(row[1] || '');
            const isGarbled = colB === 'data_insercao' || colB === 'data_ultima_modificacao';

            if (isGarbled) {
                console.log(`    Row ${i + 1} garbled, rebuilding: ${operadora}`);
                return [operadora, today, 'Ativo', today, ''];
            }
            // Pad to 5 cols
            const padded = [...row];
            while (padded.length < 5) padded.push('');
            return padded;
        });

        await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${sheetName}!A:E` });
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    ['operadora', 'data_insercao', 'status', 'data_ultima_modificacao', 'valores_anteriores'],
                    ...fixedRows,
                ],
            },
        });
        console.log(`  ✓ Fixed ${fixedRows.length} data rows`);
    }

    console.log('\n=== FIX COMPLETE ===');
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
