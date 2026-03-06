/**
 * Renames Enum_ sheets to ENUM_ (uppercase) to follow the AGG_/REF_ naming convention.
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheetsClient } from '../lib/google';

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

const RENAMES = [
    { old: 'Enum_Sexo', new: 'ENUM_Sexo' },
    { old: 'Enum_Meses', new: 'ENUM_Meses' },
    { old: 'Enum_Municipios', new: 'ENUM_Municipios' },
    { old: 'Enum_Status', new: 'ENUM_Status' },
    { old: 'Enum_Acomodacao', new: 'ENUM_Acomodacao' },
    { old: 'Enum_Pacote_Horas', new: 'ENUM_Pacote_Horas' },
];

async function run() {
    const sheets = getGoogleSheetsClient();
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetMap: Record<string, number> = {};
    for (const s of meta.data.sheets || []) {
        const title = s.properties?.title;
        const id = s.properties?.sheetId;
        if (title != null && id != null) sheetMap[title] = id;
    }

    for (const { old: oldName, new: newName } of RENAMES) {
        const sheetId = sheetMap[oldName];
        if (sheetId === undefined) { console.log(`SKIP: ${oldName} not found`); continue; }
        if (sheetMap[newName] !== undefined) { console.log(`SKIP: ${newName} already exists`); continue; }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{ updateSheetProperties: { properties: { sheetId, title: newName }, fields: 'title' } }],
            },
        });
        console.log(`✓ ${oldName} → ${newName}`);
    }
    console.log('Done.');
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
