/**
 * Tests different formula strategies for AGG_Faixa_Etaria
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheetsClient } from '../lib/google';

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

async function run() {
    const sheets = getGoogleSheetsClient();

    // Write test formulas to a temp area
    const testFormulas = [
        // Test 1: simplest SUMPRODUCT with ISNUMBER - counts where date is valid and age >= 60
        ['=SUMPRODUCT((ISNUMBER(Pacientes!D2:D100))*(INT((TODAY()-IF(ISNUMBER(Pacientes!D2:D100),Pacientes!D2:D100,TODAY()))/365.25)>=60))'],
        // Test 2: IF inside to avoid arithmetic on empties
        ['=SUMPRODUCT(IF(ISNUMBER(Pacientes!D2:D100),(INT((TODAY()-Pacientes!D2:D100)/365.25)>=60)*1,0))'],
        // Test 3: ARRAYFORMULA approach
        ['=SUMPRODUCT((Pacientes!D2:D100>0)*((TODAY()-Pacientes!D2:D100)/365.25>=60))'],
        // Test 4: check if dates are stored as numbers > 0
        ['=COUNTIF(Pacientes!D2:D100,">0")'],
        // Test 5: check exact type of first date value
        ['=TYPE(Pacientes!D2)'],
        // Test 6: first data_nascimento value as text
        ['=TEXT(Pacientes!D2,"YYYY-MM-DD")'],
    ];

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'AGG_Faixa_Etaria!F1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: testFormulas },
    });

    await new Promise(r => setTimeout(r, 2000));

    const result = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'AGG_Faixa_Etaria!F1:F10',
    });
    console.log('Test results:');
    result.data.values?.forEach((r, i) => console.log(`  Test ${i + 1}: ${r[0]}`));
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
