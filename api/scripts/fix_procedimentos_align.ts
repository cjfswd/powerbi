/**
 * Final fix for REF_Procedimentos data alignment.
 * The current data has valor=Ativo / status=date which is wrong.
 * Correct mapping after inspection:
 *   old row (7 cols): procedimento, data_criacao(date), valor_OR_status(Ativo), date, date, date, date
 * The 'valor' was lost in migration — set to empty, status='Ativo' is derived.
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheetsClient } from '../lib/google';

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;
const today = new Date().toISOString().split('T')[0];

async function run() {
    const sheets = getGoogleSheetsClient();

    const name = 'REF_Procedimentos';
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${name}!A:F` });
    const rows: any[][] = res.data.values || [];

    console.log('Current state:');
    rows.forEach((r, i) => console.log(`  [${i}]:`, r));

    // Header is correct: [procedimento, valor, status, data_insercao, data_atualizacao, valores_anteriores]
    // Data rows have valor=Ativo (wrong) and status=date (wrong)
    // Fix: valor should be '' (unknown from migration), status should be 'Ativo'
    const header = rows[0];
    const fixed = rows.slice(1).map((r: any[]) => {
        const procedimento = r[0] || '';
        // Detect if misaligned: valor col should be numeric or empty, not 'Ativo'
        const valorRaw = r[1];
        const valorIsStatus = String(valorRaw) === 'Ativo' || String(valorRaw) === 'Inativo';

        return [
            procedimento,
            valorIsStatus ? '' : valorRaw,      // valor (numeric — unknown from migration)
            'Ativo',                             // status
            r[3] || today,                       // data_insercao
            r[4] || today,                       // data_atualizacao
            r[5] || '',                          // valores_anteriores
        ];
    });

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${name}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [header, ...fixed] },
    });

    console.log('\nFixed:');
    fixed.forEach((r, i) => console.log(`  [${i + 1}]: ${r[0]?.substring(0, 45)} | valor="${r[1]}" | status="${r[2]}"`));
    console.log('\nDone.');
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
