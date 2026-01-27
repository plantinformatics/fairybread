"use client"

import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

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
    url: "#",
    icon: Home
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
                  <SidebarMenuButton 
                    render={item.inactive ? undefined : (props) => <a href={item.url} {...props} />}
                    disabled={item.inactive}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}