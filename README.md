# Dice Roller

Primeira versão de um Dice Roller web local-first.

## Recursos

- d4, d6, d8, d10, d12, d20 e d100
- múltiplos dados, até 50 por rolagem
- modificador positivo/negativo
- resultado individual de cada dado
- destaque visual para máximo/mínimo
- histórico das últimas 30 rolagens
- rolar novamente a partir do histórico
- copiar resultado
- histórico persistido em localStorage
- responsivo
- sem backend

## Rodar

```bash
pnpm install
pnpm dev
```

Abra a URL mostrada pelo Vite.

## Próxima evolução

O motor pode posteriormente ganhar expressões como:

- `2d20kh1`
- `2d20kl1`
- vantagem/desvantagem
- reroll
- dados explosivos
- presets
- personagens
- campanhas
- autenticação e PostgreSQL

## "Dispara publicação no GitHub Pages"