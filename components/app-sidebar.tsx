"use client"

import {
  Calendar,
  CheckSquare,
  GalleryVerticalEnd,
  Grid2x2,
  Group,
  Home,
  Inbox,
  PanelRight,
  Search,
  Settings,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Data Explorer",
    url: "/data-explorer",
    icon: Home,
  },
  // {
  //   title: "Button Variants",
  //   url: "/button-variants",
  //   icon: Grid2x2,
  // },
  // {
  //   title: "Input Group",
  //   url: "/input-group",
  //   icon: Group,
  // },
  // {
  //   title: "Sheet",
  //   url: "/sheet",
  //   icon: PanelRight,
  // },
  // {
  //   title: "Skeleton Variants",
  //   url: "/skeleton-variants",
  //   icon: GalleryVerticalEnd,
  // },
  // {
  //   title: "Checkbox Demo",
  //   url: "/checkbox-demo",
  //   icon: CheckSquare,
  // },
  // {
  //   title: "Inbox",
  //   url: "#",
  //   icon: Inbox,
  //   inactive: true,
  // },
  // {
  //   title: "Calendar",
  //   url: "#",
  //   icon: Calendar,
  //   inactive: true,
  // },
  // {
  //   title: "Search",
  //   url: "#",
  //   icon: Search,
  //   inactive: true,
  // },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    inactive: true,
  },
]

export function AppSidebar() {
  return (
    <Sidebar variant="sidebar" collapsible='icon'>
      <SidebarContent>
        <SidebarGroup className="h-full">
          <SidebarGroupContent className="flex h-full flex-col">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.inactive ? (
                    <SidebarMenuButton disabled>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton render={<a href={item.url} />}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <div className="group-data-[collapsible=icon]:hidden mt-auto space-y-6 px-2 pb-3 pt-4">
              <p className="text-sm text-muted-foreground">
                The <a href="https://agg.plantinformatics.io/strategic-partnership/" target="_blank" rel="noopener noreferrer" className="font-bold">Australian Grains Genebank (AGG) Strategic 
                Partnership</a> is a $30M joint investment between the Victorian State Government and 
                the <a href="https://grdc.com.au/" target="_blank" rel="noopener noreferrer" className="font-bold">Grains Research and Development Corporation (GRDC)</a> that 
                aims to unlock the genetic potential of plant genetic resources for the benefit of Australian grain growers.
              </p>
              <p className="text-sm text-muted-foreground">Passport data sourced from <a href="https://www.genesys-pgr.org/" target="_blank" rel="noopener noreferrer" className="font-bold">Genesys-PGR</a> via <a href="https://genolink.plantinformatics.io/" target="_blank" rel="noopener noreferrer">Genolink</a>. Use of this service 
                means you agree to the Genesys-PGR <a href="https://www.genesys-pgr.org/content/legal/terms" target="_blank" rel="noopener noreferrer" className="font-bold">Terms and Conditions</a> and 
                acknowledge Genesys-PGR as the original source when using passport data via Fairybread.
              </p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}