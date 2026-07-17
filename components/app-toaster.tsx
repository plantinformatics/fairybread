'use client';

import { Toaster } from 'sonner';
import { useTheme } from '@/context/theme-context';

export function AppToaster() {
  const { isDark } = useTheme();
  return <Toaster theme={isDark ? 'dark' : 'light'} richColors position="bottom-right" />;
}
