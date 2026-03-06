import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheetsClient } from '../lib/google';

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

async function run() {
    const sheets = getGoogleSheetsClient();

    for (const name of ['REF_Procedimentos', 'REF_Operadoras']) {
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${name}!A:H`,
        });
        const rows = result.data.values || [];
        console.log(`\n=== ${name} (${rows.length} rows) ===`);
        rows.slice(0, 5).forEach((r, i) => console.log(`  [${i}]:`, r));
    }
}

run().catch(e => console.error(e.message));
