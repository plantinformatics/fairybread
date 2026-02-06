import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const sides = ["right", "left", "top", "bottom"] as const;

export default function SheetPage() {
  return (
    <div className="p-6 space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Sheet</h1>
        <p className="text-sm text-muted-foreground">
          Reference page for sheet components and slots.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Sides</h2>
        <div className="flex flex-wrap gap-3">
          {sides.map((side) => (
            <Sheet key={side}>
              <SheetTrigger asChild>
                <Button variant="outline">Open {side}</Button>
              </SheetTrigger>
              <SheetContent side={side}>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Update filters, then close to apply changes.
                  </SheetDescription>
                </SheetHeader>
                <div className="px-4 text-sm text-muted-foreground">
                  Sheet content goes here.
                </div>
                <SheetFooter>
                  <Button variant="ghost">Reset</Button>
                  <Button variant="primary">Apply</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ))}
        </div>
      </section>
    </div>
  );
}
