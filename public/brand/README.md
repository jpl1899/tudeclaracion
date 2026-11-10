# tuDeclaracion — Brand assets

Archivos preparados desde el brand board original.

## Recomendación para Next.js 15

Copiar esta carpeta dentro de:

`public/brand/`

Uso del logo en un componente:

```tsx
import Image from "next/image";

<Image
  src="/brand/logo-horizontal.png"
  alt="tuDeclaración"
  width={420}
  height={172}
  priority
/>
```

Para un header compacto, usar:

`/brand/logo-mark.png`

## Favicon / metadata

Colocar `favicon.ico` en `app/favicon.ico`.

También podés usar:

- `icon-192.png`
- `icon-512.png`
- `apple-touch-icon.png`

Ejemplo en `app/layout.tsx`:

```tsx
export const metadata = {
  icons: {
    icon: "/brand/favicon.ico",
    apple: "/brand/apple-touch-icon.png",
  },
};
```

## Colores

- Navy: `#0D1B2A`
- Blue: `#164A8C`
- Green: `#22B573`
- Light: `#E6ECF1`

Tipografía definida en el brand board: Poppins Semibold / Bold.

## Nota

El material original es raster (PNG), no vectorial. Estos archivos están optimizados para uso web sin inventar un SVG falso.
