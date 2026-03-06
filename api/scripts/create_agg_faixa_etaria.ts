/**
 * Creates the AGG_Faixa_Etaria sheet with COUNTIFS formulas
 * that group Pacientes by age ranges based on data_nascimento (col D = col 4).
 *
 * Faixas:
 *   0–17    Criança/Adolescente
 *   18–39   Adulto Jovem
 *   40–59   Adulto
 *   60–79   Idoso
 *   80+     Idoso Avançado
 *   S/I     Sem Informação (data_nascimento vazia)
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheetsClient } from '../lib/google';

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

async function run() {
    const sheets = getGoogleSheetsClient();

    // Step 1: Create the new sheet tab
    console.log('Creating AGG_Faixa_Etaria sheet...');
    const addRes = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [{
                addSheet: {
                    properties: {
                        title: 'AGG_Faixa_Etaria',
                        gridProperties: { rowCount: 20, columnCount: 5 },
                    },
                },
            }],
        },
    });
    console.log('✓ Sheet created');

    // Step 2: Write header + formulas
    // Pacientes sheet: col A=id, col B=nome, col C=municipio, col D=data_nascimento, col E=sexo...
    // We assume data_nascimento is a date value. COUNTIFS with TODAY()-EDATE() is most reliable.
    //
    // Formula approach using DATEDIF to calculate age from data_nascimento:
    // =COUNTIFS(Pacientes!D:D,"<>"&"",Pacientes!H:H,"Ativo", DATEDIF(Pacientes!D:D,TODAY(),"Y"),">=0", DATEDIF(Pacientes!D:D,TODAY(),"Y"),"<=17")
    // However COUNTIFS can't use a formula as criteria range. Instead we use SUMPRODUCT.
    //
    // SUMPRODUCT approach:
    // qtd_pacientes for 18-39 (Ativo only):
    // =SUMPRODUCT((Pacientes!D2:D1000<>"")*((TODAY()-Pacientes!D2:D1000)/365.25>=18)*((TODAY()-Pacientes!D2:D1000)/365.25<40))
    // mais robusto que DATEDIF com critérios.

    const pac = 'Pacientes!D2:D10000'; // data_nascimento column
    const status = 'Pacientes!H2:H10000'; // status column

    // Helper to build age-range SUMPRODUCT formula
    const ageCountFormula = (minAge: number, maxAge: number | null) => {
        const ageExpr = `(TODAY()-${pac})/365.25`;
        const notEmpty = `(${pac}<>"")`;
        const minPart = `(${ageExpr}>=${minAge})`;
        const maxPart = maxAge !== null ? `*(${ageExpr}<${maxAge})` : '';
        const activePart = `*(${status}="Ativo")`;
        return `=SUMPRODUCT(${notEmpty}*${minPart}${maxPart}${activePart})`;
    };

    // Total active patients (for percentage)
    const totalActiveFormula = `=SUMPRODUCT((${status}="Ativo")*1)`;
    const semInfoCountFormula = `=SUMPRODUCT((${pac}="")*1)`;

    const rows = [
        ['faixa_etaria', 'qtd_pacientes', 'percentual', 'descricao'],
        ['0-17', ageCountFormula(0, 18), `=IF(E2>0,ROUND(B2/E2*100,1),0)`, 'Criança/Adolescente'],
        ['18-39', ageCountFormula(18, 40), `=IF(E2>0,ROUND(B3/E2*100,1),0)`, 'Adulto Jovem'],
        ['40-59', ageCountFormula(40, 60), `=IF(E2>0,ROUND(B4/E2*100,1),0)`, 'Adulto'],
        ['60-79', ageCountFormula(60, 80), `=IF(E2>0,ROUND(B5/E2*100,1),0)`, 'Idoso'],
        ['80+', ageCountFormula(80, null), `=IF(E2>0,ROUND(B6/E2*100,1),0)`, 'Idoso Avançado'],
        ['S/I', semInfoCountFormula, `=IF(E2>0,ROUND(B7/E2*100,1),0)`, 'Sem Informação'],
        [],
        ['total_ativos', totalActiveFormula, '', ''],
    ];

    // Fix percentage formulas to reference the total from row 9 (total_ativos = B9)
    const rowsFixed = rows.map((row, i) => {
        if (i >= 1 && i <= 6 && row[2]) {
            return [row[0], row[1], `=IF($B$9>0,ROUND(B${i + 1}/$B$9*100,1),0)`, row[3]];
        }
        return row;
    });

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'AGG_Faixa_Etaria!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: rowsFixed },
    });

    console.log('✓ Formulas written to AGG_Faixa_Etaria');
    console.log('\nReading result...');

    // Wait a moment then read back the computed values
    await new Promise(r => setTimeout(r, 2000));
    const result = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'AGG_Faixa_Etaria!A1:D10',
    });
    result.data.values?.forEach((r, i) => console.log(`  [${i}]:`, r));

    console.log('\n=== AGG_Faixa_Etaria CREATED ===');
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
