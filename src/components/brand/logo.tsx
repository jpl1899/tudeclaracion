import Image from 'next/image';

import { cn } from '@/lib/utils';

const MARK_SRC = '/brand/logo-mark.png';
const FULL_SRC = '/brand/logo-horizontal.png';

const MARK_INTRINSIC = { width: 369, height: 452 };
const FULL_INTRINSIC = { width: 1097, height: 448 };

interface LogoProps {
  /** `mark` = the cat symbol only (square-ish); `full` = the horizontal lockup with wordmark. */
  variant?: 'mark' | 'full'
  /** Sizing/spacing classes for the rendered image. */
  className?: string
  /** Pass through for above-the-fold logos (auth screens, landing header). */
  priority?: boolean
}

/**
 * tuDeclaración brand logo. Assets live in `public/brand/` (raster only — see
 * `public/brand/README.md`). Use `mark` in compact slots (headers, nav, auth
 * intro panels) and `full` where there is horizontal room.
 */
export function Logo({ variant = 'mark', className, priority = false }: LogoProps) {
  const isFull = variant === 'full';
  const src = isFull ? FULL_SRC : MARK_SRC;
  const { width, height } = isFull ? FULL_INTRINSIC : MARK_INTRINSIC;

  return (
    <Image
      src={src}
      alt="tuDeclaración"
      width={width}
      height={height}
      priority={priority}
      className={cn('object-contain', className)}
    />
  );
}
