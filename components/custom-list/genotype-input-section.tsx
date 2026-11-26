import { ClipboardList, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/custom-list/section-card';

export function GenotypeInputSection({
  file,
  isLoading,
  inputText,
  onInputTextChange,
  hasParsed,
  onParse,
  onReset,
}: {
  file: string;
  isLoading: boolean;
  inputText: string;
  onInputTextChange: (text: string) => void;
  hasParsed: boolean;
  onParse: () => void;
  onReset: () => void;
}) {
  return (
    <SectionCard
      icon={<ClipboardList className="size-4 text-muted-foreground" />}
      title="Genotype IDs"
      headerEnd={<span className="text-xs text-muted-foreground">One per line, or CSV/TSV</span>}
    >
      {/* Blocked while loading so a paste can't be parsed against a partial or wrong-crop dataset. */}
      {isLoading ? (
        <div className="flex h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading {file} data…
        </div>
      ) : (
        <>
          <textarea
            className="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            rows={8}
            placeholder={
              'Paste genotype IDs here…\n\nOne per line, or CSV/TSV (all fields are used).\nExample:\n  WAWB0001\n  WAWB0002'
            }
            value={inputText}
            onChange={(e) => onInputTextChange(e.target.value)}
          />
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={onParse} disabled={!inputText.trim()}>
              Parse
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onReset}
              disabled={!inputText && !hasParsed}
            >
              Reset
            </Button>
          </div>
        </>
      )}
    </SectionCard>
  );
}
