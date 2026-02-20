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
          Visual reference for updated sheet trigger and content variants.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Sides</h2>
        <div className="flex flex-wrap gap-3">
          {sides.map((side) => (
            <Sheet key={side}>
              <SheetTrigger render={<Button variant="outline" />}>
                Open {side}
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
                  <Button>Apply</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Without Close Button</h2>
        <Sheet>
          <SheetTrigger render={<Button variant="outline" />}>
            Open custom sheet
          </SheetTrigger>
          <SheetContent side="right" showCloseButton={false}>
            <SheetHeader>
              <SheetTitle>Export options</SheetTitle>
              <SheetDescription>
                Choose an export format and continue.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4 text-sm text-muted-foreground">
              This example hides the built-in close button and uses footer actions.
            </div>
            <SheetFooter>
              <Button variant="ghost">Cancel</Button>
              <Button>Export</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </section>
    </div>
  );
}
