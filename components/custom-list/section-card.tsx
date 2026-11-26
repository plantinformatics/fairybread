import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const countToneClasses = {
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  destructive: 'bg-destructive/10 text-destructive',
  primary: 'bg-primary/10 text-primary',
} as const;

export function SectionCard({
  icon,
  title,
  count,
  headerEnd,
  className,
  bodyClassName,
  children,
}: {
  icon: ReactNode;
  title: string;
  count?: { value: number; tone: keyof typeof countToneClasses };
  headerEnd?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn('overflow-hidden rounded-xl border bg-card', className)}>
      <header className="flex items-center justify-between gap-4 border-b bg-muted/30 px-5 py-3">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {count && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
                countToneClasses[count.tone],
              )}
            >
              {count.value}
            </span>
          )}
        </div>
        {headerEnd}
      </header>

      <div className={cn('px-5 py-4', bodyClassName)}>{children}</div>
    </section>
  );
}
