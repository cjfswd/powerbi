# Projeto Vite + React + shadcn/ui + Tailwind CSS v4

Este é um projeto starter com todas as configurações necessárias para começar a usar React, shadcn/ui, e Tailwind CSS v4.

## 🚀 O que está incluído

- **Vite**: Build tool rápido e moderno
- **React 19**: Latest version do React
- **Tailwind CSS v4**: Versão mais recente do Tailwind
- **shadcn/ui**: Biblioteca de componentes baseada em Radix UI
- **TypeScript**: Suporte completo a TypeScript
- **pnpm**: Package manager rápido e eficiente
- **Lucide React**: Ícones bonitos e customizáveis
- **PostCSS & Autoprefixer**: Processamento automático de CSS

## 📦 Dependências instaladas

```json
{
  "dependencies": {
    "@radix-ui/primitive": "^1.1.3",
    "@radix-ui/react-slot": "^1.2.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.575.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "tailwind-merge": "^3.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.1.4",
    "autoprefixer": "^10.4.27",
    "postcss": "^8.5.6",
    "shadcn": "^3.8.5",
    "tailwindcss": "^4.2.1",
    "typescript": "~5.9.3",
    "vite": "^7.3.1"
  }
}
```

## 🛠️ Scripts disponíveis

```bash
# Iniciar o servidor de desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Preview da build de produção
pnpm preview
```

## 📥 Instalando componentes shadcn/ui

Quando o registry do shadcn estiver acessível, você pode instalar componentes adicionais usando:

```bash
# Instalar um componente
pnpm exec shadcn add button

# Instalar vários componentes
pnpm exec shadcn add button card input label

# Lista completa de componentes disponíveis
pnpm exec shadcn add --help
```

### Componentes mais comuns

```bash
pnpm exec shadcn add \
  accordion \
  alert \
  alert-dialog \
  aspect-ratio \
  avatar \
  badge \
  breadcrumb \
  button \
  card \
  checkbox \
  dialog \
  dropdown-menu \
  form \
  input \
  label \
  menubar \
  pagination \
  popover \
  progress \
  radio-group \
  scroll-area \
  select \
  separator \
  sheet \
  skeleton \
  slider \
  switch \
  table \
  tabs \
  textarea \
  toggle \
  tooltip
```

## 📁 Estrutura do projeto

```
my-app/
├── src/
│   ├── components/
│   │   └── ui/              # Componentes do shadcn/ui
│   │       └── button.tsx   # Exemplo de componente
│   ├── lib/
│   │   └── utils.ts        # Utilitários (cn function)
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Entry point
│   ├── index.css           # CSS global com Tailwind
│   └── globals.css         # CSS variables
├── components.json         # Configuração do shadcn
├── tailwind.config.js      # Configuração do Tailwind
├── vite.config.js          # Configuração do Vite
├── tsconfig.json           # Configuração do TypeScript
├── postcss.config.js       # Configuração do PostCSS
└── index.html              # HTML principal
```

## 🎨 Usando componentes shadcn/ui

Após instalar um componente, você pode usá-lo assim:

```tsx
import { Button } from '@/components/ui/button'

export function MyComponent() {
  return (
    <div>
      <Button>Click me</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
    </div>
  )
}
```

## 🚀 Iniciar o projeto

1. Instale as dependências:
   ```bash
   pnpm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   pnpm dev
   ```

3. Abra no navegador:
   ```
   http://localhost:5173
   ```

## 📖 Recursos

- [Vite Docs](https://vite.dev)
- [React Docs](https://react.dev)
- [Tailwind CSS v4 Docs](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)

## 🎯 Próximos passos

1. Customize o `App.tsx` com seus componentes
2. Instale os componentes do shadcn que precisa
3. Configure as cores do tema em `globals.css` e `tailwind.config.js`
4. Comece a construir sua aplicação!

## 📝 Notas

- O alias `@` aponta para `src/`
- As variáveis CSS do tema estão em `globals.css`
- Componentes do shadcn/ui podem ser customizados em `src/components/ui/`
- Tailwind CSS v4 usando `@import "tailwindcss"`
