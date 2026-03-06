import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheetsClient } from '../lib/google';

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

async function run() {
    const sheets = getGoogleSheetsClient();

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetObj = meta.data.sheets?.find(s => s.properties?.title === 'REF_Sexo');
    if (!sheetObj) { console.log('REF_Sexo not found'); return; }

    const sheetId = sheetObj.properties?.sheetId;
    console.log('sheetId:', sheetId);
    console.log('protected:', sheetObj.protectedRanges);

    try {
        const res = await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{
                    updateSheetProperties: {
                        properties: { sheetId: sheetId!, title: 'Enum_Sexo' },
                        fields: 'title',
                    },
                }],
            },
        });
        console.log('SUCCESS:', res.status);
    } catch (e: any) {
        console.error('ERROR details:');
        console.error('message:', e.message);
        console.error('status:', e.status);
        console.error('errors:', JSON.stringify(e.errors, null, 2));
        const body = e.response?.data;
        console.error('body:', JSON.stringify(body, null, 2));
    }
}

run();
