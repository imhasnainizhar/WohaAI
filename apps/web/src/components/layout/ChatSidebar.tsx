"use client"

import * as React from "react"
import {
  IconSearch
} from "@tabler/icons-react"
import SidebarPopover from '@/components/popovers/SideBarPopover';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { RecentChats } from "../ui/RecentChats"
import { RoundedCornersPencilIcon } from "../ui/pencil"
import { WohaLogo } from '../ui/WohaLogo';
import { useThemeUtils } from "@/providers/ThemeProvider";

const fakeUser = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/logos/google-logo-svg.svg",
}

const items = [
  {
    title: "New Thread",
    url: "#",
    icon: RoundedCornersPencilIcon,
  },
  {
    title: "Search Thread",
    url: "#",
    icon: IconSearch,
  }
]

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
  const { isDarkTheme } = useThemeUtils();
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props} className={`relative
    ${(isDarkTheme && open) ? 'bg-sidebar border-none' : (!isDarkTheme && open) ? 'bg-background border border-border' : 'bg-background border-none'}`} >
      <SidebarHeader className={`pt-3!`}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <WohaLogo />
                <span className="text-base font-semibold">WohaAI</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} className={`cursor-pointer`}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <RecentChats recentChats={recentSessions} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarPopover user={fakeUser} className={`hover:bg-accent rounded-5 md:rounded-[15px]`} />
      </SidebarFooter>
    </Sidebar>
  )
}
