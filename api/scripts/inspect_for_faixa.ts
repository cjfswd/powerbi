import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheetsClient } from '../lib/google';

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

async function run() {
    const sheets = getGoogleSheetsClient();

    // Get first 3 rows of Pacientes to inspect data_nascimento format
    const pac = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pacientes!A1:K5' });
    console.log('=== Pacientes (first 5 rows) ===');
    pac.data.values?.forEach((r, i) => console.log(`[${i}]:`, r));

    // Get all rows of AGG_Sexo to see AGG pattern
    const agg = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'AGG_Sexo!A:D' });
    console.log('\n=== AGG_Sexo ===');
    agg.data.values?.forEach((r, i) => console.log(`[${i}]:`, r));

    // Check if AGG_Faixa_Etaria already exists
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const exists = meta.data.sheets?.some(s => s.properties?.title === 'AGG_Faixa_Etaria');
    console.log('\nAGG_Faixa_Etaria exists?', exists);
}

run().catch(e => console.error(e.message));
