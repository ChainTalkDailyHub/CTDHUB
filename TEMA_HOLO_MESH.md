# 🎨 CTDHub - Tema: Holo Mesh

## Visão Geral
Design premium futurista com preto profundo, âmbar luminoso e efeitos holográficos sutis.

## Paleta de Cores
```css
:root {
  --bg: #000;           /* Preto profundo */
  --panel: #0E0E0E;     /* Painéis escuros */
  --border: #2A2A2A;    /* Bordas sutis */
  --text: #F2F2F2;      /* Texto principal */
  --muted: #A8A8A8;     /* Texto secundário */
  --yellow: #FFCC33;    /* Âmbar primário */
  --holo: #8BE9FD;      /* Azul holográfico */
}
```

## Classes Utilitárias

### `.spotlight`
Efeito radial de spotlight por trás de elementos
```css
.spotlight::before {
  background: radial-gradient(circle, rgba(255,204,51,.18) 0%, transparent 60%);
  width: 28rem; height: 28rem;
  filter: blur(0.5px);
}
```

### `.card`
Container padrão com glass effect
```css
.card {
  border-radius: 1rem;
  border: 1px solid rgba(42,42,42,.8);
  background-color: rgba(14,14,14,.8);
  backdrop-filter: blur(8px);
  box-shadow: 0 0 0 1px rgba(255,255,255,.02);
}
```

### `.btn-primary`
Botão principal amarelo
```css
.btn-primary {
  background-color: #FFCC33;
  color: #000;
  hover: drop-shadow(0 0 14px rgba(255,204,51,.4));
}
```

### `.btn-ghost`
Botão secundário transparente
```css
.btn-ghost {
  border: 1px solid #2A2A2A;
  color: #FFCC33;
  hover: background-color: rgba(255,255,255,.05);
}
```

### `.chip`
Pequenos badges/tags
```css
.chip {
  border-radius: 9999px;
  border: 1px solid #2A2A2A;
  background-color: rgba(14,14,14,.7);
  padding: .25rem .75rem;
}
```

## Aplicação Global

### Páginas Atualizadas
- ✅ Home (`pages/index.tsx`)
- ✅ Courses (`pages/courses/index.tsx`)
- ✅ Quiz (`pages/quiz/index.tsx`)

### Componentes Atualizados
- ✅ Header (`components/Header.tsx`)
- ✅ Footer (`components/Footer.tsx`)
- ✅ CourseCard (`components/CourseCard.tsx`)
- ✅ QuizModuleCard (`components/QuizModuleCard.tsx`)

## Características do Design

### 1. Spotlights Radiais
- Gradientes suaves de âmbar (18% opacidade)
- Aplicados em seções Hero e cards principais
- Efeito de profundidade premium

### 2. Contraste Adequado
- Texto branco (#F2F2F2) sobre fundos escuros
- Âmbar (#FFCC33) para CTAs e destaques
- Azul holográfico (#8BE9FD) para estados especiais

### 3. Glass Morphism
- Backdrop-blur nos cards
- Bordas sutis com transparência
- Shadow outlines refinadas

### 4. Acessibilidade
- Focus rings visíveis em elementos interativos
- Contraste WCAG AA+ mantido
- Aria-labels em CTAs principais

## Deploy
- 🚀 Produção: https://extraordinary-treacle-1bc552.netlify.app
- 📝 Commit: `1313d66` - Tema: Holo Mesh (v3)

## Próximos Passos
O sistema está preparado para alternar entre temas via HTML data attributes:
```html
<html data-theme="holo">
```

Sistema de 3 temas completo:
1. ✅ Matriz (Dark theme base)
2. ✅ Neon Circuit (Cyberpunk)
3. ✅ Holo Mesh (Premium futurista)