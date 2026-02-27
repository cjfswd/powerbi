# Como fazer Push para GitHub

Como o projeto foi inicializado localmente, siga estes passos para fazer push para seu repositório:

## Opção 1: Via HTTPS (Recomendado)

```bash
cd my-app

# Adicionar remote
git remote add origin https://github.com/cjfswd/powerbi.git

# Renomear branch para main
git branch -M main

# Fazer push
git push -u origin main
```

## Opção 2: Via SSH

```bash
cd my-app

# Adicionar remote
git remote add origin git@github.com:cjfswd/powerbi.git

# Renomear branch para main
git branch -M main

# Fazer push
git push -u origin main
```

## Verificar Status

```bash
# Ver remote configurado
git remote -v

# Ver branches
git branch -a

# Ver commits
git log --oneline
```

## Se o repositório já tem conteúdo

Se o repositório no GitHub já tem dados, você pode precisar fazer:

```bash
# Pull primeiro
git pull origin main --allow-unrelated-histories

# Depois push
git push -u origin main
```

---

**Commit atual:**
```
a3d2e7e - Initial commit: Vite + React + Tailwind CSS v4 + shadcn/ui setup
```

**Arquivos inclusos:**
- ✓ Vite + React 19 setup
- ✓ Tailwind CSS v4 com @tailwindcss/postcss
- ✓ shadcn/ui componentes inicializados
- ✓ TypeScript configurado
- ✓ Button component exemplo
- ✓ Tailwind config com tema completo
- ✓ SETUP.md com instruções
