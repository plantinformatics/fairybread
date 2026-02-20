import { Search, SlidersHorizontal, X } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

export default function InputGroupPage() {
  return (
    <div className="p-6 space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Input Group</h1>
        <p className="text-sm text-muted-foreground">
          Visual reference for updated input group alignments and controls.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Search input</h2>
        <InputGroup className="max-w-sm">
          <InputGroupAddon>
            <InputGroupText>
              <Search />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="Search accessions..." />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" aria-label="Clear">
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Inline actions</h2>
        <InputGroup className="max-w-sm">
          <InputGroupAddon>
            <InputGroupText>@</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="username" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="xs" aria-label="Filters">
              <SlidersHorizontal />
              Filters
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Textarea</h2>
        <InputGroup className="max-w-lg">
          <InputGroupAddon align="block-start">
            <InputGroupText>Notes</InputGroupText>
          </InputGroupAddon>
          <InputGroupTextarea placeholder="Add notes about this accession..." />
        </InputGroup>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Block End Addon</h2>
        <InputGroup className="max-w-lg">
          <InputGroupTextarea placeholder="Leave a comment..." />
          <InputGroupAddon align="block-end" className="border-t">
            <InputGroupButton size="xs">Save draft</InputGroupButton>
            <InputGroupButton size="xs" variant="secondary">
              Submit
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </section>
    </div>
  );
}
