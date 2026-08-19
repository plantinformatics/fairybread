'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Plot-only vertical resize: the table below is a fixed size and should
// never shrink to make room, so this can't reuse `ResizablePanelGroup`
// (which always trades space between sibling panels). Instead this just
// grows/shrinks its own height directly, independent of everything below it.
const DEFAULT_HEIGHT = "60vh";
const MIN_HEIGHT_PX = 280;
// Leaves a sliver of breathing room at the bottom of the viewport instead
// of the panel touching the very edge.
const MAX_HEIGHT_VH_RATIO = 0.95;
// Fallback used only for the server-rendered pass, before we know the
// viewport size; immediately replaced on mount (and kept in sync with the
// viewport) so the real max always fills up to `MAX_HEIGHT_VH_RATIO` of the
// window, however much space is left below wherever the panel sits (e.g.
// under the sticky top nav).
const MAX_HEIGHT_FALLBACK_PX = 1400;
const KEYBOARD_STEP_PX = 24;

export function ResizablePlotPanel({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const [height, setHeight] = useState<number | string>(DEFAULT_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  // Mirrors the container's actual rendered height in pixels, for use in
  // aria-valuenow and keyboard stepping. Refs can't be read during render,
  // so this is only ever updated from an effect / event handler.
  const [renderedHeightPx, setRenderedHeightPx] = useState<number>(MIN_HEIGHT_PX);
  // The max is however much of `MAX_HEIGHT_VH_RATIO` viewport height is left
  // below the panel's own top edge — i.e. 95vh minus whatever sits above it
  // (the sticky top nav, etc.) — tracked in state (rather than read directly
  // during render) so it stays correct if the window resizes.
  const [maxHeightPx, setMaxHeightPx] = useState<number>(MAX_HEIGHT_FALLBACK_PX);

  useEffect(() => {
    const updateMaxHeight = () => {
      const top = containerRef.current?.getBoundingClientRect().top ?? 0;
      setMaxHeightPx(Math.max(MIN_HEIGHT_PX, window.innerHeight * MAX_HEIGHT_VH_RATIO - top));
    };
    updateMaxHeight();
    window.addEventListener("resize", updateMaxHeight);
    return () => window.removeEventListener("resize", updateMaxHeight);
  }, []);

  const clamp = useCallback(
    (value: number) => Math.min(maxHeightPx, Math.max(MIN_HEIGHT_PX, value)),
    [maxHeightPx]
  );

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    setRenderedHeightPx(Math.round(containerRef.current.getBoundingClientRect().height));
  }, [height]);

  const currentHeightPx = useCallback(() => {
    if (typeof height === "number") return height;
    return containerRef.current?.getBoundingClientRect().height ?? MIN_HEIGHT_PX;
  }, [height]);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!dragStartRef.current) return;
      const delta = event.clientY - dragStartRef.current.startY;
      setHeight(clamp(dragStartRef.current.startHeight + delta));
    },
    [clamp]
  );

  // Attach/detach the window-level drag listeners for the lifetime of a
  // single drag gesture, keyed off `isDragging` rather than a self-removing
  // handler so cleanup is unambiguous.
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerUp = () => setIsDragging(false);
    document.body.style.cursor = "row-resize";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.body.style.cursor = "";
      dragStartRef.current = null;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, handlePointerMove]);

  const startDragging = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    dragStartRef.current = {
      startY: event.clientY,
      startHeight: containerRef.current?.getBoundingClientRect().height ?? MIN_HEIGHT_PX,
    };
    setIsDragging(true);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHeight(clamp(currentHeightPx() - KEYBOARD_STEP_PX));
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setHeight(clamp(currentHeightPx() + KEYBOARD_STEP_PX));
      }
    },
    [clamp, currentHeightPx]
  );

  const resetHeight = useCallback(() => setHeight(DEFAULT_HEIGHT), []);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="w-full overflow-hidden"
        style={{ height: typeof height === "number" ? `${height}px` : height }}
      >
        {children}
      </div>
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize plot height"
        aria-valuenow={renderedHeightPx}
        aria-valuemin={MIN_HEIGHT_PX}
        aria-valuemax={maxHeightPx}
        tabIndex={0}
        onPointerDown={startDragging}
        onKeyDown={handleKeyDown}
        onDoubleClick={resetHeight}
        className="relative flex h-1.5 w-full shrink-0 cursor-row-resize touch-none items-center justify-center outline-none select-none after:absolute after:inset-x-0 after:-top-1.5 after:-bottom-1.5 focus-visible:ring-1 focus-visible:ring-ring"
      >
        <div className="h-px w-full bg-border" />
        <div className="absolute z-10 h-1 w-6 shrink-0 rounded-lg bg-border" />
      </div>
    </div>
  );
}
