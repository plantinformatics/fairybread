"use client"

import Link from "next/link"
import { useQueryState } from "nuqs"
import {
  Calendar,
  CheckSquare,
  GalleryVerticalEnd,
  Grid2x2,
  Group,
  Home,
  Inbox,
  ListFilter,
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
import type { LucideIcon } from "lucide-react"
import { usePcaData } from "@/context/pca-data-context"
import { serializeView, viewParsers } from "@/lib/view-url"

type SidebarNavItem = {
  title: string
  url: string
  icon: LucideIcon
  inactive?: boolean
  // When false, shared params are NOT carried over to this page's URL.
  // Defaults to true — opt out rather than opt in.
  preserveParams?: boolean
}

const items: SidebarNavItem[] = [
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
    title: "Custom List",
    url: "/custom-list",
    icon: ListFilter,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings
  },
]

export function AppSidebar() {
  const { file, subset } = usePcaData()
  const [groupBy] = useQueryState("groupBy", viewParsers.groupBy)

  return (
    <Sidebar variant="sidebar" collapsible='icon'>
      <SidebarContent>
        <SidebarGroup className="h-full">
          <SidebarGroupContent className="flex h-full flex-col">
            <SidebarMenu>
              {items.map((item) => {
                // Default is to preserve shared params; set preserveParams: false
                // on items (like Settings) that don't need them.
                const href = item.preserveParams !== false
                  ? serializeView(item.url, { file, subset, groupBy })
                  : item.url

                return (
                  <SidebarMenuItem key={item.title}>
                    {item.inactive ? (
                      <SidebarMenuButton disabled>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton render={<Link href={href} />}>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}