'use client';

import { ChevronDown, FileText, Sprout } from "lucide-react"
import { parseAsString, useQueryState } from "nuqs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PCAFileInfo } from "@/config/pca-location-config";

export default function BreadCrumbNav() {
  const cropOptions = Array.from(PCAFileInfo.keys());
  const [selectedCrop, setSelectedCrop] = useQueryState("file", parseAsString.withDefault("Wheat"));
  const selectedFileInfo = PCAFileInfo.get(selectedCrop ?? "Wheat") ?? PCAFileInfo.get("Wheat");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href="/"
            className="text-foreground font-semibold tracking-tight text-base"
          >
            FairyBread
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center">
              <span className="inline-flex h-8 min-w-30 items-center gap-1.5 rounded-md border bg-background px-2 text-sm shadow-xs hover:bg-muted/60">
                <Sprout className="size-3.5 text-muted-foreground" />
                <span className="flex-1 text-left font-medium text-foreground">
                  {selectedCrop || "Select crop"}
                </span>
                <ChevronDown className="size-3.5 shrink-0" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {cropOptions.map((crop) => (
                <DropdownMenuItem
                  key={crop}
                  onClick={() => {
                    void setSelectedCrop(crop);
                  }}
                >
                  {crop}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink
            href={selectedFileInfo?.doiUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-[30vw] items-center gap-1.5 leading-none text-foreground"
            title={selectedFileInfo?.doiTitle ?? "DOI"}
          >
            <FileText className="size-3.5 shrink-0" />
            <span className="truncate">{selectedFileInfo?.doiTitle ?? "DOI"}</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}