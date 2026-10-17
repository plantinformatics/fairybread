"use client"

import { usePcaData } from "@/context/pca-data-context"

/** Shows what the shared PCA data load is doing, with a progress bar once the body is downloading. */
export function DataLoadStatus() {
  const { file, progress } = usePcaData()
  if (!progress) return null

  const percent = progress.stage === "downloading" ? progress.percent : 0

  return (
    <div className="flex w-56 flex-col gap-2">
      <div className="flex justify-between gap-4 whitespace-nowrap tabular-nums">
        <span>{progress.stage === "fetching" ? `Fetching ${file}` : `Downloading ${file}`}</span>
        {progress.stage === "downloading" && <span>{percent}%</span>}
      </div>
      <div className="bg-border h-0.5 w-full overflow-hidden">
        <div className="bg-foreground h-full transition-[width]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
