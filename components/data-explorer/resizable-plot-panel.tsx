'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { positiveIntegerCodec } from "@/lib/storage-codecs";

// Resizes only its own height, unlike `ResizablePanelGroup`, which would shrink the table below.
export const DEFAULT_PLOT_HEIGHT = "60vh";
const MIN_HEIGHT_PX = 280;
const MAX_HEIGHT_VH_RATIO = 0.95;
const MAX_HEIGHT_FALLBACK_PX = 1400;
const KEYBOARD_STEP_PX = 24;
const HEIGHT_STORAGE_KEY = "pca-plot-panel-height";

export function ResizablePlotPanel({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const [storedHeight, setStoredHeight, resetHeight] = usePersistedState(
    HEIGHT_STORAGE_KEY,
    null,
    positiveIntegerCodec,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [renderedHeightPx, setRenderedHeightPx] = useState<number>(MIN_HEIGHT_PX);
  // 95vh less whatever sits above the panel (e.g. the top nav).
  const [maxHeightPx, setMaxHeightPx] = useState<number>(MAX_HEIGHT_FALLBACK_PX);

  useLayoutEffect(() => {
    const measureMaxHeight = () => {
      const top = containerRef.current?.getBoundingClientRect().top ?? 0;
      setMaxHeightPx(Math.max(MIN_HEIGHT_PX, window.innerHeight * MAX_HEIGHT_VH_RATIO - top));
    };
    measureMaxHeight();
    window.addEventListener("resize", measureMaxHeight);
    return () => window.removeEventListener("resize", measureMaxHeight);
  }, []);

  const clamp = useCallback(
    (value: number) => Math.min(maxHeightPx, Math.max(MIN_HEIGHT_PX, value)),
    [maxHeightPx]
  );
  const height = storedHeight === null ? null : clamp(storedHeight);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    setRenderedHeightPx(Math.round(containerRef.current.getBoundingClientRect().height));
  }, [height]);

  const currentHeightPx = useCallback(
    () => height ?? containerRef.current?.getBoundingClientRect().height ?? MIN_HEIGHT_PX,
    [height]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!dragStartRef.current) return;
      const delta = event.clientY - dragStartRef.current.startY;
      setStoredHeight(clamp(dragStartRef.current.startHeight + delta));
    },
    [clamp, setStoredHeight]
  );

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
        setStoredHeight(clamp(currentHeightPx() - KEYBOARD_STEP_PX));
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setStoredHeight(clamp(currentHeightPx() + KEYBOARD_STEP_PX));
      }
    },
    [clamp, currentHeightPx, setStoredHeight]
  );

  return (
    <div className="w-full min-w-0">
      <div
        ref={containerRef}
        className="w-full min-w-0 overflow-hidden"
        style={{ height: height === null ? DEFAULT_PLOT_HEIGHT : `${height}px` }}
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
