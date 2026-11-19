'use client';

import { ChevronDown, FileText, SquareArrowOutUpRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DatasetCitation } from "@/config/pca-location-config";
import { cn } from "@/lib/utils";

/**
 * Links to the primary source dataset. Merged datasets (more than one citation)
 * get a "+N" menu next to the link listing every source DOI.
 */
export default function DatasetCitations({
  citations,
  className,
}: {
  citations: DatasetCitation[];
  className?: string;
}) {
  const [primary, ...others] = citations;
  if (!primary) return <span className={className}>—</span>;

  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      <a
        href={primary.doiUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={primary.title}
        className={cn("inline-flex min-w-0 items-center gap-1.5 leading-none hover:underline", className)}
      >
        <FileText className="size-3.5 shrink-0" />
        <span className="truncate">{primary.title}</span>
        <SquareArrowOutUpRight className="size-3.5 shrink-0" />
      </a>
      {others.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Show all ${citations.length} source datasets`}
            className="inline-flex h-5 shrink-0 items-center gap-0.5 rounded-md border bg-background px-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          >
            +{others.length}
            <ChevronDown className="size-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-auto max-w-[min(32rem,90vw)]">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Merged dataset · {citations.length} sources</DropdownMenuLabel>
              {citations.map((citation) => (
                <DropdownMenuItem
                  key={citation.doiUrl}
                  render={<a href={citation.doiUrl} target="_blank" rel="noopener noreferrer" />}
                >
                  <FileText className="text-muted-foreground" />
                  <span className="truncate">{citation.title}</span>
                  <SquareArrowOutUpRight className="ml-auto text-muted-foreground" />
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </span>
  );
}
