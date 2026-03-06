/**
 * Final fix for AGG_Faixa_Etaria.
 * Problem: SUMPRODUCT with arithmetic on empty cells causes #VALUE! error
 * Solution: Use IF(ISNUMBER(date), ..., 0) inside SUMPRODUCT to safely skip empties
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheetsClient } from '../lib/google';

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

const D = 'Pacientes!D2:D10000'; // data_nascimento
const H = 'Pacientes!H2:H10000'; // status

/**
 * SUMPRODUCT with IF inside to avoid arithmetic errors on empty date cells.
 * =SUMPRODUCT(IF(ISNUMBER(D),(INT((TODAY()-D)/365.25)>=min)*( ... )*(H="Ativo"),0))
 */
function ageRangeFormula(minAge: number, maxAge: number | null): string {
    const age = `INT((TODAY()-${D})/365.25)`;
    const minCond = `(${age}>=${minAge})`;
    const maxCond = maxAge !== null ? `*(${age}<${maxAge})` : '';
    const activeCond = `*(${H}="Ativo")`;
    return `=SUMPRODUCT(IF(ISNUMBER(${D}),${minCond}${maxCond}${activeCond},0))`;
}

const semInfoFormula = `=SUMPRODUCT((${D}="")*(${H}="Ativo"))`;
const totalFormula = `=SUMPRODUCT((${H}="Ativo")*1)`;

async function run() {
    const sheets = getGoogleSheetsClient();

    // Expand the sheet grid first (needs enough rows and columns)
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetObj = meta.data.sheets?.find(s => s.properties?.title === 'AGG_Faixa_Etaria');
    const sheetId = sheetObj?.properties?.sheetId;

    if (sheetId !== undefined) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{
                    updateSheetProperties: {
                        properties: { sheetId, gridProperties: { rowCount: 30, columnCount: 8 } },
                        fields: 'gridProperties',
                    },
                }],
            },
        });
        console.log('✓ Grid expanded to 30x8');
    }

    const data = [
        ['faixa_etaria', 'qtd_pacientes', 'percentual', 'descricao'],
        ['0-17', ageRangeFormula(0, 18), '=IF($B$9>0,ROUND(B2/$B$9*100,1),0)', 'Criança/Adolescente'],
        ['18-39', ageRangeFormula(18, 40), '=IF($B$9>0,ROUND(B3/$B$9*100,1),0)', 'Adulto Jovem'],
        ['40-59', ageRangeFormula(40, 60), '=IF($B$9>0,ROUND(B4/$B$9*100,1),0)', 'Adulto'],
        ['60-79', ageRangeFormula(60, 80), '=IF($B$9>0,ROUND(B5/$B$9*100,1),0)', 'Idoso'],
        ['80+', ageRangeFormula(80, null), '=IF($B$9>0,ROUND(B6/$B$9*100,1),0)', 'Idoso Avançado'],
        ['S/I', semInfoFormula, '=IF($B$9>0,ROUND(B7/$B$9*100,1),0)', 'Sem Informação'],
        [],
        ['total_ativos', totalFormula, '', ''],
    ];

    await sheets.spreadsheets.values.clear({ spreadsheetId, range: 'AGG_Faixa_Etaria!A:H' });
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'AGG_Faixa_Etaria!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: data },
    });

    console.log('✓ Formulas written. Waiting for calculation...');
    await new Promise(r => setTimeout(r, 3000));

    // Read back calculated values
    const result = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'AGG_Faixa_Etaria!A1:D10',
        valueRenderOption: 'FORMATTED_VALUE',
    } as any);

    console.log('Result:');
    result.data.values?.forEach((r, i) => console.log(`  [${i}]:`, r));
    console.log('\n=== COMPLETE ===');
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
