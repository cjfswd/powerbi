import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/lib/DashboardDataContext';
import { savePrintReportSnapshot } from '@/lib/print-report';

export function PDFExportButton() {
  const { 
    kpis, faturamentoMensal, distribuicaoAssistencia, tipoProcedimento, 
    distribuicaoMunicipio, perfilSexo, valorOperadora, pacientes, faixaEtaria,
    statusPacienteConfig,
    globalOperadora, globalAno, globalMes
  } = useDashboard();

  const handleExport = () => {
    savePrintReportSnapshot({
      generatedAt: new Date().toISOString(),
      filters: {
        operadora: globalOperadora,
        ano: globalAno,
        mes: globalMes,
      },
      data: {
        kpis,
        faturamentoMensal,
        distribuicaoAssistencia,
        tipoProcedimento,
        distribuicaoMunicipio,
        perfilSexo,
        valorOperadora,
        pacientes,
        faixaEtaria,
      },
      statusPacienteConfig,
    });

    const printUrl = `/print-report?ts=${Date.now()}`;
    const printWindow = window.open(printUrl, '_blank');

    if (!printWindow) {
      window.location.assign(printUrl);
    }
  };

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
      <FileText className="h-4 w-4" />
      Exportar PDF
    </Button>
  );
}

export default PDFExportButton;
