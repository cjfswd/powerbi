/**
 * Migration script: Restructure Google Sheets reference tabs
 *
 * 1. Removes sheet protection from REF_ tabs (so we can rename them)
 * 2. Renames static REF tabs to Enum_ prefix
 * 3. Adds "valor" header to Enum tabs if missing
 * 4. Adds auditing columns to dynamic REF tabs (Procedimentos, Operadoras)
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheetsClient } from '../lib/google';

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

const ENUM_SHEETS = [
    { old: 'REF_Sexo', new: 'Enum_Sexo' },
    { old: 'REF_Meses', new: 'Enum_Meses' },
    { old: 'REF_Municipios', new: 'Enum_Municipios' },
    { old: 'REF_Status', new: 'Enum_Status' },
    { old: 'REF_Acomodacao', new: 'Enum_Acomodacao' },
    { old: 'REF_Pacote_Horas', new: 'Enum_Pacote_Horas' },
];

const DYNAMIC_REF_SHEETS = [
    { name: 'REF_Procedimentos' },
    { name: 'REF_Operadoras' },
];

const AUDIT_COLS = ['data_insercao', 'status', 'data_ultima_modificacao', 'valores_anteriores'];

async function run() {
    const sheets = getGoogleSheetsClient();

    // Step 1: Get the spreadsheet metadata
    console.log('\n=== STEP 1: Reading spreadsheet metadata ===');
    const meta = await sheets.spreadsheets.get({ spreadsheetId, includeGridData: false });
    const allSheets = meta.data.sheets || [];
    const sheetMap: Record<string, { id: number; protectedRangeIds: number[] }> = {};

    for (const s of allSheets) {
        const title = s.properties?.title;
        const id = s.properties?.sheetId;
        if (title == null || id == null) continue;
        const protectedRangeIds = (s.protectedRanges || []).map((p: any) => p.protectedRangeId).filter((id: any) => id != null);
        sheetMap[title] = { id, protectedRangeIds };
    }
    console.log('Found sheets:', Object.keys(sheetMap));

    // Step 2: Remove protection from enum sheets so we can rename them
    console.log('\n=== STEP 2: Removing protection from REF_ enum sheets ===');
    for (const { old: oldName } of ENUM_SHEETS) {
        const info = sheetMap[oldName];
        if (!info) { console.log(`  SKIP: ${oldName} not found`); continue; }
        if (info.protectedRangeIds.length === 0) { console.log(`  OK: ${oldName} has no protection`); continue; }

        console.log(`  Removing ${info.protectedRangeIds.length} protection(s) from: ${oldName}`);
        for (const pid of info.protectedRangeIds) {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: { requests: [{ deleteProtectedRange: { protectedRangeId: pid } }] },
            });
            console.log(`    ✓ Removed protection: ${pid}`);
        }
    }

    // Step 3: Rename enum sheets (one at a time)
    console.log('\n=== STEP 3: Renaming REF_ sheets to Enum_ ===');
    // Re-read metadata after removing protections
    const meta2 = await sheets.spreadsheets.get({ spreadsheetId });
    const updatedSheets = meta2.data.sheets || [];
    const updatedMap: Record<string, number> = {};
    for (const s of updatedSheets) {
        const title = s.properties?.title;
        const id = s.properties?.sheetId;
        if (title != null && id != null) updatedMap[title] = id;
    }

    for (const { old: oldName, new: newName } of ENUM_SHEETS) {
        const sheetId = updatedMap[oldName];
        if (sheetId === undefined) { console.log(`  SKIP: ${oldName} not found`); continue; }
        if (updatedMap[newName] !== undefined) { console.log(`  SKIP: ${newName} already exists`); continue; }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{
                    updateSheetProperties: {
                        properties: { sheetId, title: newName },
                        fields: 'title',
                    },
                }],
            },
        });
        console.log(`  ✓ Renamed: ${oldName} → ${newName}`);
    }

    // Step 4: Ensure enum sheets have a "valor" header row
    console.log('\n=== STEP 4: Ensuring Enum sheets have a "valor" header ===');
    // Re-read metadata again after renames
    const meta3 = await sheets.spreadsheets.get({ spreadsheetId });
    const finalMap: Record<string, number> = {};
    for (const s of meta3.data.sheets || []) {
        const title = s.properties?.title;
        const id = s.properties?.sheetId;
        if (title != null && id != null) finalMap[title] = id;
    }

    for (const { new: enumName } of ENUM_SHEETS) {
        if (finalMap[enumName] === undefined) { console.log(`  SKIP: ${enumName} not found`); continue; }

        const result = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${enumName}!A1`,
        });
        const firstCell = result.data.values?.[0]?.[0];
        if (String(firstCell).toLowerCase() === 'valor') {
            console.log(`  OK: ${enumName} already has header "valor"`);
            continue;
        }

        // Insert row at top, then write header
        const sheetId = finalMap[enumName];
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
            range: `${enumName}!A1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [['valor']] },
        });
        console.log(`  ✓ Added "valor" header to: ${enumName}`);
    }

    // Step 5: Add auditing columns to dynamic REF sheets
    console.log('\n=== STEP 5: Adding auditing columns to dynamic REF sheets ===');
    const today = new Date().toISOString().split('T')[0];

    for (const { name: sheetName } of DYNAMIC_REF_SHEETS) {
        console.log(`\n  Processing: ${sheetName}`);

        const result = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:Z`,
        });
        const rows = result.data.values || [];

        if (rows.length === 0) { console.log(`    No data found, skipping.`); continue; }

        const headerRow = rows[0].map((h: any) => String(h).toLowerCase().trim());
        console.log(`    Current headers: [${headerRow.join(', ')}]`);

        const colsToAdd = AUDIT_COLS.filter(col => !headerRow.includes(col));
        if (colsToAdd.length === 0) { console.log(`    All audit columns already exist. Skipping.`); continue; }
        console.log(`    Adding columns: [${colsToAdd.join(', ')}]`);

        const newHeader = [...rows[0], ...colsToAdd];
        const newDataRows = rows.slice(1).map((row: any[]) => {
            const padded = [...row];
            while (padded.length < rows[0].length) padded.push('');
            for (const col of colsToAdd) {
                if (col === 'data_insercao') padded.push(today);
                else if (col === 'status') padded.push('Ativo');
                else if (col === 'data_ultima_modificacao') padded.push(today);
                else if (col === 'valores_anteriores') padded.push('');
                else padded.push('');
            }
            return padded;
        });

        await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${sheetName}!A:Z` });
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [newHeader, ...newDataRows] },
        });
        console.log(`    ✓ Updated ${sheetName}: +${colsToAdd.length} cols, ${newDataRows.length} data rows.`);
    }

    console.log('\n=== MIGRATION COMPLETE ===');
}

run().catch(e => { console.error('MIGRATION FAILED:', e.message ?? e); process.exit(1); });
