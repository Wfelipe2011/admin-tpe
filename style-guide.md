## 💅 Style Guide — Baseado no Design System do Figma (atualizado)

Quando for gerar interfaces, siga essas instruções:

> “Use o seguinte style guide e tokens de design para gerar componentes React/Angular/Tailwind.
> Priorize as cores e tipografia definidas abaixo, mantenha espaçamento baseado em 8px, e aplique os estados e variações conforme descrito no guia.”

---

### 🎨 **Cores**

| Nome                      | HEX / Gradient                                     | Uso                                                                                                                                                                          |
| ------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primária**              | `#374192`                                          | Cor base principal. Use em botões primários, cabeçalhos, ícones de ação e elementos de destaque. Garante contraste e identidade visual.                                      |
| **Secundária**            | `#929BD2`                                          | Cor de apoio. Use em botões secundários, bordas, ícones neutros e backgrounds sutis para estados de hover.                                                                   |
| **Gradiente Primário**    | `linear-gradient(90deg, #181C43 0%, #374192 100%)` | Use em grandes áreas de destaque (hero sections, barras superiores, ou backgrounds de componentes de impacto). Evite em botões pequenos para não comprometer a legibilidade. |
| **Hover**                 | `#46607F`                                          | Estado de interação para elementos baseados na cor primária.                                                                                                                 |
| **Fundo**                 | `#FFFFFF`                                          | Fundo geral da aplicação.                                                                                                                                                    |
| **Fundo Secundário**      | `#F8F8F8`                                          | Áreas internas, cards, blocos de conteúdo.                                                                                                                                   |
| **Texto Principal**       | `#333333`                                          | Títulos e textos de corpo.                                                                                                                                                   |
| **Texto Secundário**      | `#666666`                                          | Legendas e textos de apoio.                                                                                                                                                  |
| **Texto em Fundo Escuro** | `#FFFFFF`                                          | Textos sobre botões ou áreas escuras.                                                                                                                                        |
| **Erro**                  | `#E74C3C`                                          | Mensagens de erro e alertas negativos.                                                                                                                                       |
| **Sucesso**               | `#2ECC71`                                          | Mensagens de sucesso e confirmações.                                                                                                                                         |
| **Aviso**                 | `#F1C40F`                                          | Alertas e mensagens de aviso.                                                                                                                                                |

---

### ✍️ **Tipografia**

- **Fonte principal:** `Inter`, sans-serif
- **Pesos disponíveis:** Regular, Medium, SemiBold, Bold
- **Hierarquia:**

  - H1 – 24px / 1.2 / SemiBold
  - H2 – 20px / 1.3 / SemiBold
  - Body – 14px / 1.5 / Regular
  - Caption – 12px / 1.4 / Regular
  - Botões/Links – 14px / 1 / Medium

---

### 📏 **Espaçamentos e Grid**

- Unidade base: múltiplos de **4px** ou **8px**
- Paddings & Margins: `8px, 16px, 24px, 32px`
- Gutter entre colunas: `24px`

#### **Mobile First (Responsivo)**

- **Mobile (< 640px):** Use espaçamentos mínimos para aproveitar máximo do espaço
  - Padding lateral: `8px` (mínimo necessário)
  - Padding vertical: `12px`
  - Margens entre elementos: `8px, 12px`
  - Sem gutters desnecessários
- **Tablet/Desktop (≥ 640px):** Espaçamentos padrão aplicados

- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

---

### 🧩 **Componentes Base**

- **Botão**

  - Primário: fundo **#374192**, texto branco.
  - Secundário: fundo branco, borda **#929BD2**, texto **#374192**.
  - Ghost: fundo transparente, texto **#374192**.
  - Hover: use a variação **#46607F**.
  - Estados: Normal, Hover, Disabled.

- **Input de Texto**

  - Padrão, Com ícone, Com label flutuante.
  - Estados: Normal, Focus, Erro, Disabled.

- **Card**

  - Padrão (fundo branco, sombra leve).
  - Com cabeçalho e rodapé.

- **Modal**

  - Título + corpo + botões de ação.

- **Navegação Lateral**

  - Expandida / Colapsada.

- **Dropdown**

  - Padrão.

---

### 📱 **Diretrizes Mobile**

Para telas menores que 640px, aplique as seguintes otimizações:

- **Aproveitamento máximo do espaço:**

  - Use apenas `padding: 8px` nas laterais (mínimo necessário)
  - Evite margens excessivas entre elementos
  - Reduza espaçamentos verticais para `12px` quando apropriado

- **Componentes otimizados:**

  - Cards: padding interno reduzido para `12px`
  - Botões: largura total (`w-full`) quando fizer sentido
  - Inputs: aproveitar largura disponível
  - Modais: margin mínima das bordas (`8px`)

- **Layout responsivo:**

  - Elementos em coluna única
  - Navegação colapsada por padrão
  - Textos e botões com tamanhos adequados ao toque

- **Classes Tailwind mobile:**

  ```css
  /* Aplicar apenas em mobile */
  .mobile-optimized {
    @apply px-2 py-3 space-y-2;
  }

  /* Responsive breakpoint */
  @media (max-width: 639px) {
    .container {
      @apply px-2;
    }
  }
  ```

---

### 🌗 **Tema**

- Apenas **modo claro** definido no momento.

---

### 🧱 **Design Tokens (CSS Variables / Tailwind Config)**

```css
:root {
  /* 🎨 Cores principais */
  --color-primary: #374192;
  --color-secondary: #929bd2;
  --color-primary-gradient: linear-gradient(90deg, #181c43 0%, #374192 100%);
  --color-hover: #46607f;

  /* 🧱 Fundos e textos */
  --color-background-light: #ffffff;
  --color-background-medium: #f8f8f8;
  --color-text-dark: #333333;
  --color-text-medium: #666666;
  --color-text-light: #ffffff;

  /* ⚠️ Estados */
  --color-error: #e74c3c;
  --color-success: #2ecc71;
  --color-warning: #f1c40f;

  /* ✍️ Tipografia */
  --font-family-base: "Inter", sans-serif;
  --font-size-h1: 24px;
  --font-size-h2: 20px;
  --font-size-body: 14px;
  --font-size-caption: 12px;

  /* 📏 Espaçamentos padrão (desktop) */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* � Espaçamentos mobile (otimizados) */
  --spacing-mobile-xs: 4px;
  --spacing-mobile-sm: 8px;
  --spacing-mobile-md: 12px;
  --spacing-mobile-lg: 16px;
  --spacing-mobile-xl: 20px;

  /* 📱 Paddings específicos mobile */
  --padding-mobile-lateral: 8px; /* Mínimo necessário nas laterais */
  --padding-mobile-vertical: 12px; /* Vertical otimizado */
  --margin-mobile-elementos: 8px; /* Entre elementos */

  /* �🔲 Bordas e sombras */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --shadow-sm: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

/* 📱 Media query para mobile */
@media (max-width: 639px) {
  :root {
    --spacing-xs: var(--spacing-mobile-xs);
    --spacing-sm: var(--spacing-mobile-sm);
    --spacing-md: var(--spacing-mobile-md);
    --spacing-lg: var(--spacing-mobile-lg);
    --spacing-xl: var(--spacing-mobile-xl);
  }
}
```
