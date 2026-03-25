"use client"

import { Home, Settings } from "lucide-react"

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
  //   icon: Grid2X2,
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
              <img src="/grdc3.svg" alt="GRDC 3" className="w-full h-auto" />
              <img src="/agiVic.svg" alt="AGI Vic" className="w-full h-auto" />
              <img src="/grdc2.svg" alt="GRDC 2" className="w-full h-auto" />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}