import { Button, ButtonArrow } from "@/components/ui/button";

const variants = [
  "primary",
  "mono",
  "destructive",
  "secondary",
  "outline",
  "dashed",
  "ghost",
  "dim",
  "foreground",
  "inverse",
] as const;

const sizes = ["lg", "md", "sm", "xs", "icon"] as const;
const radii = ["md", "full"] as const;
const appearances = ["default", "ghost"] as const;
const modes = ["default", "icon", "link", "input"] as const;
const underlines = ["solid", "dashed"] as const;

export default function ButtonVariantsPage() {
  return (
    <div className="p-6 space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Button Variants</h1>
        <p className="text-sm text-muted-foreground">
          Visual reference for Button variants, sizes, and modes.
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
        <h2 className="text-lg font-medium">Size</h2>
        <div className="flex flex-wrap items-center gap-3">
          {sizes.map((size) => (
            <Button key={size} size={size}>
              {size === "icon" ? <ButtonArrow /> : size}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Radius</h2>
        <div className="flex flex-wrap gap-3">
          {radii.map((radius) => (
            <Button key={radius} radius={radius}>
              radius {radius}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Appearance</h2>
        <div className="flex flex-wrap gap-3">
          {appearances.map((appearance) => (
            <Button key={appearance} variant="primary" appearance={appearance}>
              appearance {appearance}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Mode</h2>
        <div className="flex flex-wrap items-center gap-3">
          {modes.map((mode) => (
            <Button key={mode} mode={mode} variant="outline">
              {mode}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button mode="icon" variant="outline" size="icon">
            <ButtonArrow />
          </Button>
          <Button mode="link" variant="primary" underline="solid">
            link solid
          </Button>
          <Button mode="link" variant="primary" underline="dashed">
            link dashed
          </Button>
          <Button mode="link" variant="primary" underlined="solid">
            underlined solid
          </Button>
          <Button mode="link" variant="primary" underlined="dashed">
            underlined dashed
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button mode="input" variant="outline" size="sm" placeholder>
            placeholder input
          </Button>
          <Button mode="input" variant="outline" size="sm">
            input
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Auto Height</h2>
        <div className="flex flex-wrap items-start gap-3">
          <Button autoHeight size="sm">
            autoHeight sm
          </Button>
          <Button autoHeight size="md">
            autoHeight md
          </Button>
          <Button autoHeight size="lg">
            autoHeight lg
          </Button>
        </div>
      </section>
    </div>
  );
}
