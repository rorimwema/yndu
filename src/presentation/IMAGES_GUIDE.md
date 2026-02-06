# Image Assets Guide

## Folder Structure (Vue 3 + Vite)

Based on expert Vue/Nuxt skills, images are organized into two locations:

### 📁 `src/assets/images/` - Processed Assets
**Use for**: Images imported by Vue components

**Characteristics**:
- ✅ Processed by Vite (optimized, hashed, bundled)
- ✅ Can use with `import` or dynamic `import()`
- ✅ Supports relative imports: `import logo from '@/assets/images/logo.png'`
- ✅ Gets hashed filename in production (cache-busting)
- ✅ Tree-shaken if unused

**Examples**:
```vue
<script setup>
import productImage from '@/assets/images/products/tomato.jpg'
</script>

<template>
  <img :src="productImage" alt="Fresh tomato" />
</template>
```

**Best for**:
- Product photos
- UI icons and graphics
- Logos and branding
- Any image referenced by component code

---

### 📁 `public/images/` - Static Assets
**Use for**: Images served directly, referenced by URL

**Characteristics**:
- ✅ Served from root `/images/...`
- ✅ No processing by Vite (served as-is)
- ✅ Referenced by absolute path: `/images/banner.jpg`
- ✅ Available at build time
- ✅ Good for large files (videos, large photos)

**Examples**:
```vue
<template>
  <!-- Direct URL reference -->
  <img src="/images/hero-banner.jpg" alt="Hero banner" />
  
  <!-- In CSS -->
  <div class="hero" style="background-image: url('/images/hero-bg.jpg')">
</template>
```

**Best for**:
- Hero banners
- Large background images
- Images referenced in meta tags (OG images)
- User-uploaded content
- Files that shouldn't be processed

---

## Image Optimization Best Practices

### Formats
| Format | Use Case | Expert Recommendation |
|--------|----------|---------------------|
| **WebP** | Photos | ✅ Primary format - 25-35% smaller than JPEG |
| **AVIF** | High-quality photos | ✅ Best compression, use with WebP fallback |
| **SVG** | Icons, logos | ✅ Scalable, tiny file size |
| **PNG** | Transparency needed | ⚠️ Only when transparency required |
| **JPEG** | Compatibility | ⚠️ Fallback for older browsers |

### VueUse Image Helpers
```typescript
import { useImage } from '@vueuse/core'

const { isLoading, error } = useImage({ src: '/images/photo.jpg' })
```

### Lazy Loading
```vue
<template>
  <!-- Native lazy loading -->
  <img 
    src="/images/photo.jpg" 
    loading="lazy"
    alt="Description"
  />
  
  <!-- Or use VueUse -->
  <img 
    v-if="imageInView"
    src="/images/photo.jpg"
    alt="Description"
  />
</template>

<script setup>
import { useIntersectionObserver } from '@vueuse/core'

const imageRef = ref(null)
const imageInView = ref(false)

useIntersectionObserver(imageRef, ([{ isIntersecting }]) => {
  if (isIntersecting) imageInView.value = true
})
</script>
```

### Responsive Images
```vue
<picture>
  <source 
    srcset="/images/hero-400.webp 400w,
            /images/hero-800.webp 800w,
            /images/hero-1200.webp 1200w"
    sizes="(max-width: 600px) 400px,
           (max-width: 1000px) 800px,
           1200px"
    type="image/webp"
  >
  <img 
    src="/images/hero-800.jpg" 
    alt="Hero image"
    loading="lazy"
  >
</picture>
```

---

## Naming Conventions

### ✅ Good
```
src/assets/images/
├── products/
│   ├── tomato.webp
│   ├── spinach.webp
│   └── organic-badge.svg
├── icons/
│   ├── cart.svg
│   └── user.svg
└── logo.svg

public/images/
├── hero-banner.webp
├── about-team.jpg
└── seasonal-promo-feb-2025.webp
```

### ❌ Avoid
```
image1.jpg
IMG_2025.jpg
Photo Feb 6.jpg
Untitled-1.png
```

---

## Current Structure

```
src/presentation/
├── src/assets/images/     # Component images (processed)
│   └── (empty - add product images here)
├── public/images/         # Static images (served directly)
│   └── (empty - add banners/hero images here)
└── README.md             # This file
```

---

## Recommended Next Steps

1. **Add product images** to `src/assets/images/products/`
2. **Add hero banners** to `public/images/`
3. **Convert to WebP** for better performance
4. **Use lazy loading** for below-fold images
5. **Implement responsive images** with srcset

---

## Resources

- [Vite Static Asset Handling](https://vitejs.dev/guide/assets.html)
- [VueUse Image](https://vueuse.org/core/useImage/)
- [WebP Conversion](https://squoosh.app/)
- [Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
