"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  RadioTowerIcon,
  GlobeIcon,
  ClipboardListIcon,
  CreditCardIcon,
  BarChart3Icon,
  FileTextIcon,
} from "lucide-react"

type NavItem = {
  name: string
  url: string
  icon: React.ReactNode
}

// Generic, reusable group — same structure/behavior as the original NavDocuments
function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const { isMobile } = useSidebar()
  return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton render={<a href={item.url} />}>
                  {item.icon}
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
  )
}

// --- Network ---
export function NavNetwork() {
  const items: NavItem[] = [
    { name: "Routers", url: "/routers", icon: <RadioTowerIcon /> },
    { name: "Sessions", url: "/sessions", icon: <GlobeIcon /> },
  ]
  return <NavGroup label="Network" items={items} />
}

// --- Billing ---
export function NavBilling() {
  const items: NavItem[] = [
    { name: "Subscriptions", url: "/subscriptions", icon: <ClipboardListIcon /> },
    { name: "Payments", url: "/payments", icon: <CreditCardIcon /> },
  ]
  return <NavGroup label="Billing" items={items} />
}

// --- Reports ---
export function NavReports() {
  const items: NavItem[] = [
    { name: "Analytics", url: "/analytics", icon: <BarChart3Icon /> },
    { name: "Audit Logs", url: "/audit-logs", icon: <FileTextIcon /> },
  ]
  return <NavGroup label="Reports" items={items} />
}