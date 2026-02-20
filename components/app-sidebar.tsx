"use client"

import { Calendar, Home, Inbox, Search, Settings, SquareMousePointer, Grid2X2, ListFilter, Group, PanelRight, GalleryVerticalEnd, CheckSquare } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
  {
    title: "Alert Dialog",
    url: "/alert-dialog",
    icon: SquareMousePointer,
  },
  {
    title: "Button Variants",
    url: "/button-variants",
    icon: Grid2X2,
  },
  {
    title: "Combobox",
    url: "/combobox",
    icon: ListFilter,
  },
  {
    title: "Input Group",
    url: "/input-group",
    icon: Group,
  },
  {
    title: "Sheet",
    url: "/sheet",
    icon: PanelRight,
  },
  {
    title: "Skeleton Variants",
    url: "/skeleton-variants",
    icon: GalleryVerticalEnd,
  },
  {
    title: "Checkbox Demo",
    url: "/checkbox-demo",
    icon: CheckSquare,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
    inactive: true,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
    inactive: true,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
    inactive: true,
  },
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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.inactive ? (
                    <SidebarMenuButton disabled>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}