/**
 * Syncs the computed Faixa Etária aggregation to the AGG_Faixa_Etaria sheet.
 * This script computes the values server-side and writes them as static values.
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheetsClient } from '../lib/google';

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

async function run() {
    const sheets = getGoogleSheetsClient();

    // 1. Fetch raw data
    console.log('Fetching raw data...');
    const res = await sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges: ['Pacientes!A2:K10000', 'Procedimentos_Realizados!A2:I10000'],
    });

    const rawPacientes = res.data.valueRanges?.[0].values || [];
    const rawPR = res.data.valueRanges?.[1].values || [];

    // Helper functions (simplified from api/sheets.ts)
    const str = (v: any) => (v != null ? String(v).trim() : '');
    const num = (v: any) => {
        if (v == null || v === '') return 0;
        const s = String(v).replace(/\./g, '').replace(',', '.');
        const n = parseFloat(s);
        return isNaN(n) ? 0 : n;
    };

    const SHEETS_EPOCH = new Date('1899-12-30').getTime();
    const MS_PER_DAY = 86400000;
    const todayMs = Date.now();

    function calcAge(raw: any): number | null {
        if (raw == null || raw === '') return null;
        const n = Number(raw);
        if (!isNaN(n) && n > 1000) {
            const birthMs = SHEETS_EPOCH + n * MS_PER_DAY;
            return Math.floor((todayMs - birthMs) / (365.25 * MS_PER_DAY));
        }
        const d = new Date(str(raw));
        if (!isNaN(d.getTime())) {
            return Math.floor((todayMs - d.getTime()) / (365.25 * MS_PER_DAY));
        }
        return null;
    }

    const FAIXAS = [
        { label: '0-11', min: 0, max: 12, descricao: 'Criança' },
        { label: '12-17', min: 12, max: 18, descricao: 'Adolescente' },
        { label: '18-29', min: 18, max: 30, descricao: 'Jovem Adulto' },
        { label: '30-59', min: 30, max: 60, descricao: 'Adulto' },
        { label: '60-79', min: 60, max: 80, descricao: 'Idoso' },
        { label: '80+', min: 80, max: null, descricao: 'Idoso em Idade Avançada' },
    ];

    const counts: Record<string, number> = { '0-11': 0, '12-17': 0, '18-29': 0, '30-59': 0, '60-79': 0, '80+': 0, 'S/I': 0 };
    const faturamento: Record<string, number> = { '0-11': 0, '12-17': 0, '18-29': 0, '30-59': 0, '60-79': 0, '80+': 0, 'S/I': 0 };
    const glosas: Record<string, number> = { '0-11': 0, '12-17': 0, '18-29': 0, '30-59': 0, '60-79': 0, '80+': 0, 'S/I': 0 };

    // Map procedures to patients
    const custoPorPaciente: Record<string, number> = {};
    const glosaPorPaciente: Record<string, number> = {};

    rawPR.forEach(r => {
        const pid = str(r[1]);
        const valor = num(r[7]);
        const glosa = num(r[8]);
        if (pid) {
            custoPorPaciente[pid] = (custoPorPaciente[pid] || 0) + valor;
            glosaPorPaciente[pid] = (glosaPorPaciente[pid] || 0) + glosa;
        }
    });

    // Aggregate by age
    let totalAtivos = 0;
    rawPacientes.forEach(r => {
        if (str(r[7]) !== 'Ativo') return;
        totalAtivos++;

        const pid = str(r[0]);
        const age = calcAge(r[3]);
        const label = age === null
            ? 'S/I'
            : (FAIXAS.find(f => age >= f.min && (f.max === null || age < f.max))?.label ?? 'S/I');

        counts[label]++;
        faturamento[label] += (custoPorPaciente[pid] || 0);
        glosas[label] += (glosaPorPaciente[pid] || 0);
    });

    // Prepare data for update
    const header = ['faixa_etaria', 'qtd_pacientes', 'percentual', 'descricao', 'valor_faturado', 'valor_glosado'];
    const data = FAIXAS.map(f => {
        const q = counts[f.label];
        const p = totalAtivos > 0 ? (q / totalAtivos * 100).toFixed(1) : '0';
        return [f.label, q, p + '%', f.descricao, faturamento[f.label], glosas[f.label]];
    });

    const siQtd = counts['S/I'];
    const siPerc = totalAtivos > 0 ? (siQtd / totalAtivos * 100).toFixed(1) : '0';
    data.push(['S/I', siQtd, siPerc + '%', 'Sem Informação', faturamento['S/I'], glosas['S/I']]);

    data.push([]);
    data.push(['total_ativos', totalAtivos, '100%', '', Object.values(faturamento).reduce((a, b) => a + b, 0), Object.values(glosas).reduce((a, b) => a + b, 0)]);

    console.log('Writing to AGG_Faixa_Etaria...');
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'AGG_Faixa_Etaria!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [header, ...data] },
    });

    console.log('✓ AGG_Faixa_Etaria synced successfully.');
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
