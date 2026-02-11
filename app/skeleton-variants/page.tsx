import { Skeleton } from "@/components/ui/skeleton"

const lineWidths = ["w-full", "w-5/6", "w-2/3", "w-1/2"] as const

const blockSizes = [
  { label: "xs", className: "h-10 w-10" },
  { label: "sm", className: "h-14 w-14" },
  { label: "md", className: "h-20 w-20" },
  { label: "lg", className: "h-28 w-28" },
] as const

export default function SkeletonVariantsPage() {
  return (
    <div className="space-y-10 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Skeleton Variants</h1>
        <p className="text-sm text-muted-foreground">
          Visual reference for common skeleton loading states.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Text Lines</h2>
        <div className="space-y-2 rounded-md border p-4">
          {lineWidths.map((width) => (
            <Skeleton key={width} className={`h-4 ${width}`} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Shape Blocks</h2>
        <div className="flex flex-wrap items-end gap-4 rounded-md border p-4">
          {blockSizes.map((item) => (
            <div key={item.label} className="space-y-2">
              <Skeleton className={item.className} />
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
          <div className="space-y-2">
            <Skeleton className="size-20 rounded-full" />
            <p className="text-xs text-muted-foreground">circle</p>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-20 w-20 rounded-sm" />
            <p className="text-xs text-muted-foreground">square</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Avatar + Text</h2>
        <div className="space-y-4 rounded-md border p-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Card</h2>
        <div className="max-w-xl space-y-4 rounded-md border p-4">
          <Skeleton className="h-44 w-full rounded-lg" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Table Rows</h2>
        <div className="space-y-3 rounded-md border p-4">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-14" />
          </div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Form Inputs</h2>
        <div className="max-w-xl space-y-4 rounded-md border p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </section>
    </div>
  )
}
