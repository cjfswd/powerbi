/**
 * Adds valor_glosado header to Procedimentos_Realizados (column I)
 * and updates AGG_Faixa_Etaria to include valor_faturado and valor_glosado per faixa.
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheetsClient } from '../lib/google';

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

async function run() {
    const sheets = getGoogleSheetsClient();

    // ─── Step 1: Add valor_glosado to Procedimentos_Realizados ───────────────
    console.log('\n=== Step 1: Procedimentos_Realizados — adding valor_glosado column ===');
    const pr = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Procedimentos_Realizados!A1:I1',
    });
    const header = pr.data.values?.[0] || [];
    console.log('  Current header:', header);

    if (header.includes('valor_glosado')) {
        console.log('  valor_glosado already exists, skipping.');
    } else {
        // Append valor_glosado to the header row only (data rows will have empty I column by default)
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Procedimentos_Realizados!I1',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [['valor_glosado']] },
        });
        console.log('  ✓ Added valor_glosado header at column I');
    }

    // ─── Step 2: Update AGG_Faixa_Etaria with valor_faturado and valor_glosado ─
    // These use SUMPRODUCT joining Procedimentos_Realizados (by paciente_id = col B)
    // with Pacientes (id = col A, data_nascimento = col D).
    // Since cross-sheet SUMPRODUCT is complex and dates are empty, we add the columns
    // as placeholders with the formula comment — values will be computed server-side.
    console.log('\n=== Step 2: Updating AGG_Faixa_Etaria structure ===');

    const D = 'Pacientes!D2:D10000';
    const H = 'Pacientes!H2:H10000';
    function ageRangeFormula(minAge: number, maxAge: number | null): string {
        const age = `INT((TODAY()-${D})/365.25)`;
        const minCond = `(${age}>=${minAge})`;
        const maxCond = maxAge !== null ? `*(${age}<${maxAge})` : '';
        return `=SUMPRODUCT(IF(ISNUMBER(${D}),${minCond}${maxCond}*(${H}="Ativo"),0))`;
    }

    const totalFormula = `=SUMPRODUCT((${H}="Ativo")*1)`;
    const semInfoFormula = `=SUMPRODUCT((${D}="")*(${H}="Ativo"))`;

    const faixes = [
        { label: '0-11', descricao: 'Criança', formula: ageRangeFormula(0, 12), row: 2 },
        { label: '12-17', descricao: 'Adolescente', formula: ageRangeFormula(12, 18), row: 3 },
        { label: '18-29', descricao: 'Jovem Adulto', formula: ageRangeFormula(18, 30), row: 4 },
        { label: '30-59', descricao: 'Adulto', formula: ageRangeFormula(30, 60), row: 5 },
        { label: '60-79', descricao: 'Idoso', formula: ageRangeFormula(60, 80), row: 6 },
        { label: '80+', descricao: 'Idoso em Idade Avançada', formula: ageRangeFormula(80, null), row: 7 },
        { label: 'S/I', descricao: 'Sem Informação', formula: semInfoFormula, row: 8 },
    ];

    const data = [
        // Updated header: now includes valor_faturado and valor_glosado
        ['faixa_etaria', 'qtd_pacientes', 'percentual', 'descricao', 'valor_faturado', 'valor_glosado'],
        ...faixes.map(f => [
            f.label,
            f.formula,
            `=IF($B$10>0,ROUND(B${f.row}/$B$10*100,1),0)`,
            f.descricao,
            // valor_faturado and valor_glosado: placeholders (computed & written by the API)
            0,
            0,
        ]),
        [],
        ['total_ativos', totalFormula, '', '', '', ''],
    ];

    await sheets.spreadsheets.values.clear({ spreadsheetId, range: 'AGG_Faixa_Etaria!A:F' });
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'AGG_Faixa_Etaria!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: data },
    });
    console.log('  ✓ AGG_Faixa_Etaria updated with valor_faturado + valor_glosado columns');

    // Verify
    await new Promise(r => setTimeout(r, 1500));
    const result = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'AGG_Faixa_Etaria!A1:F11',
    });
    result.data.values?.forEach((r, i) => console.log(`  [${i}]:`, r));

    console.log('\n=== DONE ===');
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
