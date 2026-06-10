"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import SidebarPopover from '@/components/popovers/SideBarPopover';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { RecentChats } from "../ui/RecentChats"

const data = {
    // Example user data
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/logos/google-logo-svg.svg",
  },
  navMain: [
    {
      title: "New Thread",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Search Thread",
      url: "#",
      icon: IconChartBar,
    }
  ],
}

const recentSessions = [
  {
    id: "1",
    title: "LangGraph Agent Debugging",
    href: "/chat/1",
  },
  {
    id: "2",
    title: "Next.js Sidebar Design",
    href: "/chat/2",
  },
]

export function ChatSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className={`relative border-none!`} >
      <SidebarHeader className={`pt-3!`}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5! cursor-pointer"
            >
              <Link href="/">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">WohaAI</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <RecentChats recentChats={recentSessions} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarPopover user={data.user} className={`hover:bg-accent rounded-5 md:rounded-[15px]`} />
      </SidebarFooter>
    </Sidebar>
  )
}
