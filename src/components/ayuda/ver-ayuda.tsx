import Link from 'next/link';
import { cn } from '@/lib/utils';
import { hrefAyuda } from '@/modules/ayuda/anclas';

/** "Ver ayuda" link to the help entry that explains a message. */
export function VerAyuda({ ancla, className }: { ancla: string, className?: string }) {
  return (
    <Link href={hrefAyuda(ancla)} className={cn('w-fit font-medium text-primary underline-offset-4 hover:underline', className)}>
      Ver ayuda
    </Link>
  );
}
