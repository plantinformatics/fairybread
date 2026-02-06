import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

const grains = [
  { value: "wheat", label: "Wheat" },
  { value: "barley", label: "Barley" },
  { value: "oats", label: "Oats" },
  { value: "rye", label: "Rye" },
  { value: "sorghum", label: "Sorghum" },
];

export default function ComboboxPage() {
  return (
    <div className="p-6 space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Combobox</h1>
        <p className="text-sm text-muted-foreground">
          Reference page for combobox components and slots.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Basic</h2>
        <Combobox>
          <ComboboxInput placeholder="Pick a grain..." className="max-w-sm" />
          <ComboboxContent>
            <ComboboxEmpty>No results.</ComboboxEmpty>
            <ComboboxList>
              {grains.map((item) => (
                <ComboboxItem key={item.value} value={item.value}>
                  {item.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </section>
    </div>
  );
}
