/**
 * Updates AGG_Faixa_Etaria sheet with the new faixa structure:
 * 0-11, 12-17, 18-29, 30-59, 60-79, 80+, S/I
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheetsClient } from '../lib/google';

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

const D = 'Pacientes!D2:D10000'; // data_nascimento
const H = 'Pacientes!H2:H10000'; // status

function ageRangeFormula(minAge: number, maxAge: number | null): string {
    const age = `INT((TODAY()-${D})/365.25)`;
    const minCond = `(${age}>=${minAge})`;
    const maxCond = maxAge !== null ? `*(${age}<${maxAge})` : '';
    return `=SUMPRODUCT(IF(ISNUMBER(${D}),${minCond}${maxCond}*(${H}="Ativo"),0))`;
}

const semInfoFormula = `=SUMPRODUCT((${D}="")*(${H}="Ativo"))`;
const totalFormula = `=SUMPRODUCT((${H}="Ativo")*1)`;

// Row for each faixa (B9 = total_ativos)
const faixes = [
    { label: '0-11', descricao: 'Criança', formula: ageRangeFormula(0, 12), row: 2 },
    { label: '12-17', descricao: 'Adolescente', formula: ageRangeFormula(12, 18), row: 3 },
    { label: '18-29', descricao: 'Jovem Adulto', formula: ageRangeFormula(18, 30), row: 4 },
    { label: '30-59', descricao: 'Adulto', formula: ageRangeFormula(30, 60), row: 5 },
    { label: '60-79', descricao: 'Idoso', formula: ageRangeFormula(60, 80), row: 6 },
    { label: '80+', descricao: 'Idoso em Idade Avançada', formula: ageRangeFormula(80, null), row: 7 },
    { label: 'S/I', descricao: 'Sem Informação', formula: semInfoFormula, row: 8 },
];

async function run() {
    const sheets = getGoogleSheetsClient();

    const data = [
        ['faixa_etaria', 'qtd_pacientes', 'percentual', 'descricao'],
        ...faixes.map(f => [
            f.label,
            f.formula,
            `=IF($B$10>0,ROUND(B${f.row}/$B$10*100,1),0)`,
            f.descricao,
        ]),
        [], // blank separator
        ['total_ativos', totalFormula, '', ''],
    ];

    await sheets.spreadsheets.values.clear({ spreadsheetId, range: 'AGG_Faixa_Etaria!A:D' });
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'AGG_Faixa_Etaria!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: data },
    });

    console.log('✓ AGG_Faixa_Etaria updated with new faixas');
    await new Promise(r => setTimeout(r, 2000));

    const result = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'AGG_Faixa_Etaria!A1:D11',
    });
    result.data.values?.forEach((r, i) => console.log(`  [${i}]:`, r));
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
