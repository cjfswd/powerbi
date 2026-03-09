import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { testSections, testSummary } from "@/data/testCatalog"

const kindLabel: Record<string, string> = {
  unit: "Unitario",
  integration: "Integracao",
  e2e: "E2E",
  manual: "Manual",
}

export function TestesPage() {
  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Central de Testes</CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-6">
                Esta pagina agora lista tanto os testes automatizados quanto os scripts de diagnostico
                que antes estavam espalhados e fora de visibilidade.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{testSummary.total}</p>
              </div>
              <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Automatizados</p>
                <p className="text-2xl font-bold text-blue-700">{testSummary.automated}</p>
              </div>
              <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Diagnostico</p>
                <p className="text-2xl font-bold text-amber-700">{testSummary.manual}</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {testSections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle className="text-lg">{section.title}</CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border/80 bg-muted/20 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                        {kindLabel[item.kind]}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="min-w-[240px] space-y-2 rounded-lg border bg-background p-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Arquivo</p>
                      <code className="block break-all text-xs text-foreground">{item.file}</code>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Comando</p>
                      <code className="block break-all text-xs text-foreground">{item.command}</code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
