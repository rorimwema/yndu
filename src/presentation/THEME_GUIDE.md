# Yndu UI/UX Theme Guide

## Inter Font

**Font Family**: Inter (Variable Font)
**Source**: https://rsms.me/inter/

### Features
- Variable font support for smooth weight transitions
- Optimized for UI design with excellent legibility
- Automatic ligatures and contextual alternates

### CSS Implementation
```css
:root {
  font-family: Inter, sans-serif;
  font-feature-settings: 'liga' 1, 'calt' 1;
}

@supports (font-variation-settings: normal) {
  :root {
    font-family: InterVariable, sans-serif;
  }
}
```

---

## Flexoki Color System

### Base Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--flexoki-bg` | `rgb(237, 238, 207)` | Light cream background |
| `--flexoki-primary` | `rgb(102, 128, 11)` | Olive green - primary actions |
| `--flexoki-warning` | `rgb(175, 48, 41)` | Red - warnings, destructive actions |
| `--flexoki-paper` | `rgb(255, 252, 240)` | Card backgrounds |

### Extended Palette

**Grays (11 shades)**:
- 50: `rgb(242, 240, 236)` - Lightest
- 100-900: Progressive darkening
- 950: `rgb(28, 27, 23)` - Darkest

**Semantic Colors**:
- Red: `rgb(175, 48, 41)` - Errors
- Orange: `rgb(188, 82, 21)` - Warnings
- Yellow: `rgb(173, 131, 18)` - Caution
- Green: `rgb(102, 128, 11)` - Success, Primary
- Cyan: `rgb(36, 131, 123)` - Info
- Blue: `rgb(32, 94, 166)` - Links
- Purple: `rgb(94, 64, 157)` - Accent
- Magenta: `rgb(160, 47, 111)` - Special

---

## CSS Utility Classes

### Backgrounds
```css
.bg-flexoki              /* Cream background */
.bg-flexoki-primary      /* Olive green */
.bg-flexoki-warning      /* Red */
.bg-flexoki-paper        /* Paper white */
```

### Text Colors
```css
.text-flexoki            /* Dark gray text */
.text-flexoki-primary    /* Olive green */
.text-flexoki-warning    /* Red */
.text-flexoki-muted      /* Muted gray */
```

### Borders
```css
.border-flexoki          /* Light border */
.border-flexoki-primary  /* Primary border */
```

### Components
```css
.btn-primary    /* Primary button (olive green) */
.btn-warning    /* Warning button (red) */
.input-flexoki  /* Form input style */
.card-flexoki   /* Card container */
```

---

## Usage Examples

### Button
```vue
<button class="btn-primary">Place Order</button>
<button class="btn-warning">Cancel</button>
```

### Card
```vue
<div class="card-flexoki p-6">
  <h3 class="text-flexoki font-semibold">Order Summary</h3>
  <p class="text-flexoki-muted">3 items selected</p>
</div>
```

### Form Input
```vue
<input 
  class="input-flexoki w-full px-4 py-2 rounded-lg"
  placeholder="Enter your address"
/>
```

---

## Dark Mode Support

The theme includes automatic dark mode detection:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --flexoki-bg: rgb(28, 27, 23);
    --flexoki-paper: rgb(16, 16, 16);
    --flexoki-text: rgb(206, 202, 193);
  }
}
```

---

## Typography

### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Letter Spacing
- Headings: `-0.025em` (tighter)
- Body: Normal

### Line Height
- Body text: `1.6`

---

## Best Practices

1. **Use semantic color names** instead of hardcoded values
2. **Leverage CSS variables** for theming consistency
3. **Maintain contrast ratios** - Flexoki colors are designed for accessibility
4. **Use Inter's variable font** for smooth weight transitions
5. **Apply `font-feature-settings`** for better typography

---

## Resources

- **Inter Font**: https://rsms.me/inter/
- **Flexoki Colors**: https://flexoki.com
- **Yndu Design System**: This guide + `assets/css/flexoki.css`
