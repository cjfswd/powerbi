import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheetsClient } from '../lib/google';

async function run() {
    try {
        const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
        if (!spreadsheetId) throw new Error('No GOOGLE_SHEETS_ID');
        const sheets = getGoogleSheetsClient();

        // Get all sheets
        const res = await sheets.spreadsheets.get({ spreadsheetId });
        const sheetTitles = res.data.sheets?.map(s => s.properties?.title) || [];
        console.log("SHEETS:", sheetTitles);

        // For each sheet, get the first row (headers)
        for (const title of sheetTitles) {
            if (!title) continue;
            const range = `${title}!A1:Z1`;
            try {
                const data = await sheets.spreadsheets.values.get({ spreadsheetId, range });
                console.log(`--- ${title} ---`);
                console.log(data.data.values ? data.data.values[0] : 'EMPTY');
            } catch (e: any) {
                console.log(`--- ${title} --- ERROR: ${e.message}`);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

run();
