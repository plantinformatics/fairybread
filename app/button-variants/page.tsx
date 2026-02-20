import { ArrowRight, Download, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

const variants = ["default", "outline", "secondary", "ghost", "destructive", "link"] as const;
const textSizes = ["xs", "sm", "default", "lg"] as const;
const iconSizes = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const;

export default function ButtonVariantsPage() {
  return (
    <div className="p-6 space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Button Variants</h1>
        <p className="text-sm text-muted-foreground">
          Visual reference for the current button variants and sizes.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Variant</h2>
        <div className="flex flex-wrap gap-3">
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Text Sizes</h2>
        <div className="flex flex-wrap items-center gap-3">
          {textSizes.map((size) => (
            <Button key={size} size={size}>
              size {size}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Icon Sizes</h2>
        <div className="flex flex-wrap items-center gap-3">
          {iconSizes.map((size) => (
            <Button key={size} size={size} aria-label={size}>
              <Plus />
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Inline Icons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <Plus data-icon="inline-start" />
            Create accession
          </Button>
          <Button variant="outline">
            Download
            <Download data-icon="inline-end" />
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">States</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Enabled</Button>
          <Button disabled>Disabled</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="destructive" disabled>
            Delete disabled
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Button Group</h2>
        <ButtonGroup>
          <Button variant="outline">Prev</Button>
          <Button variant="outline">Next</Button>
          <Button variant="outline" size="icon-sm" aria-label="Go">
            <ArrowRight />
          </Button>
        </ButtonGroup>
      </section>
    </div>
  );
}
