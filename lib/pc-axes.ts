export const PC_OPTIONS = [
  'PC1', 'PC2', 'PC3', 'PC4', 'PC5',
  'PC6', 'PC7', 'PC8', 'PC9', 'PC10',
] as const;
export type PcAxis = typeof PC_OPTIONS[number];

export interface PcAxes {
  x: PcAxis;
  y: PcAxis;
  z: PcAxis | null;
}

export const DEFAULT_PC_AXES: PcAxes = { x: 'PC1', y: 'PC2', z: null };

export const isPcAxis = (value: unknown): value is PcAxis =>
  typeof value === 'string' && (PC_OPTIONS as readonly string[]).includes(value);

/** Read `PcAxes` from untrusted data, replacing each invalid field with its default. */
export function toPcAxes(value: unknown): PcAxes | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const { x, y, z } = value as Record<string, unknown>;
  return {
    x: isPcAxis(x) ? x : DEFAULT_PC_AXES.x,
    y: isPcAxis(y) ? y : DEFAULT_PC_AXES.y,
    z: isPcAxis(z) ? z : null,
  };
}
