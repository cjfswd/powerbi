import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Welcome to shadcn/ui + Vite + React</h1>
            <p className="text-xl text-muted-foreground mt-4">
              This is a starter template with Tailwind CSS v4, shadcn/ui components, and React
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Button Examples</h2>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Button Sizes</h2>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <div className="space-y-4 p-6 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold">Installation Status</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Vite configured</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>React 19 installed</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Tailwind CSS v4 configured</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>shadcn/ui initialized</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-500">⚠</span>
                <span>Additional components need to be installed</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Next Steps</h2>
            <p className="text-muted-foreground">
              To install more shadcn/ui components, run:
            </p>
            <code className="block p-4 bg-muted rounded-lg text-sm">
              pnpm exec shadcn add button card input label
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
