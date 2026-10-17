/** Covers the plot while data or the plot itself is loading. Static on purpose: no spinner repaints. */
export function LoadingOverlay({ children = "Loading..." }: { children?: React.ReactNode }) {
  return (
    <div className="bg-background/70 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-xs">
      <div className="text-muted-foreground bg-card rounded-md text-sm shadow-xs border px-4 py-3 leading-none font-medium">
        {children}
      </div>
    </div>
  );
}
