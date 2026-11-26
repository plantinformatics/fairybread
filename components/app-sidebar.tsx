"use client"

import Link from "next/link"
import { useQueryState } from "nuqs"
import { Home, ListFilter, Settings } from "lucide-react"

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
import { searchParams, serializeSearchParams } from "@/config/search-params"

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
  const [groupBy] = useQueryState("groupBy", searchParams.groupBy)

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
                  ? serializeSearchParams(item.url, { file, subset, groupBy })
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