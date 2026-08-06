"use client"

import * as React from "react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Wifi, WifiOff, Users, Activity, Router, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"


type SystemStatus = {
    success: boolean
    data: {
        server: {
            status: string
            uptime: number
            timestamp: string
        }
        mikrotik: {
            status: string
            connected: boolean
            online: boolean
            error: string | null
            activeSessions: number
            totalUsers: number
            lastCheck: string
            cpu?: { load: number }
            memory?: { percentUsed: string }
        }
        business: {
            activeSubscriptions: number
            totalUsers: number
            pendingPayments: number
            revenue: {
                today: number
                thisMonth: number
            }
        }
    }
}

type Notification = {
    id: number
    title: string
    message: string
    type: string
    isRead: boolean
    createdAt: string
}


function formatUptime(seconds: number): string {
    if (!seconds) return "0s"
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (d > 0) return `${d}d ${h}h`
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 0,
    }).format(amount)
}



export function SiteHeader() {
    const router = useRouter()
    const [now, setNow] = React.useState(new Date())
    const [status, setStatus] = React.useState<SystemStatus["data"] | null>(null)
    const [statusError, setStatusError] = React.useState(false)
    const [notifications, setNotifications] = React.useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = React.useState(0)
    const [showNotifications, setShowNotifications] = React.useState(false)
    const [adminName, setAdminName] = React.useState("Admin")
    const notificationRef = React.useRef<HTMLDivElement>(null)

    // ===== CLOCK =====
    React.useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(id)
    }, [])

    // ===== CLOSE NOTIFICATIONS ON OUTSIDE CLICK =====
    React.useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // ===== GET ADMIN NAME FROM TOKEN =====
    React.useEffect(() => {
        try {
            const user = localStorage.getItem("user")
            if (user) {
                const parsed = JSON.parse(user)
                setAdminName(parsed.fullName || parsed.username || "Admin")
            }
        } catch {}
    }, []);

    // ===== FETCH SYSTEM STATUS =====
    React.useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/system/metrics`, { cache: "no-store" })
                if (!res.ok) throw new Error("Failed")
                const result: SystemStatus = await res.json()
                setStatus(result.data)
                setStatusError(false)
            } catch {
                setStatusError(true)
            }
        }

        fetchStatus()
        const id = setInterval(fetchStatus, 15000)
        return () => clearInterval(id)
    }, [])

// ===== FETCH NOTIFICATIONS =====
    React.useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch(`/api/notifications/my-notifications?limit=10`, { cache: "no-store" })
                if (!res.ok) return
                const result = await res.json()
                const notifs: Notification[] = result.data?.notifications || []
                setNotifications(notifs)
                setUnreadCount(notifs.filter((n) => !n.isRead).length)
            } catch {}
        }

        fetchNotifications()
        const id = setInterval(fetchNotifications, 30000)
        return () => clearInterval(id)
    }, [])

    // ===== MARK ALL AS READ =====
    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem("token")
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`,
                {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
            setUnreadCount(0)
        } catch {}
    }

    // ===== TIME & GREETING =====
    const getCurrentTime = () => {
        const h = now.getHours()
        const m = now.getMinutes()
        const s = now.getSeconds()
        const pm = h >= 12
        const displayHour = h % 12 === 0 ? 12 : h % 12
        return `${displayHour}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s} ${pm ? "PM" : "AM"}`
    }

    const greeting = () => {
        const h = now.getHours()
        if (h < 12) return "Good Morning"
        if (h < 18) return "Good Afternoon"
        return "Good Evening"
    }

    const isOnline = !statusError && status?.mikrotik?.online === true
    const activeSessions = status?.mikrotik?.activeSessions ?? 0
    const activeSubscriptions = status?.business?.activeSubscriptions ?? 0
    const pendingPayments = status?.business?.pendingPayments ?? 0
    const revenueToday = status?.business?.revenue?.today ?? 0

    // ===== NOTIFICATION ICON COLOR =====
    const getNotifColor = (type: string) => {
        if (type.includes("expired") || type.includes("failed")) return "text-red-500"
        if (type.includes("warning") || type.includes("expired")) return "text-yellow-500"
        if (type.includes("activated") || type.includes("completed")) return "text-green-500"
        return "text-blue-500"
    }

    return (
        <TooltipProvider>
            <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) bg-background rounded-t-lg">
                <div className="flex w-full items-center justify-between gap-2 px-4 lg:px-6">

                    {/* ===== LEFT: Trigger + Status ===== */}
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mx-1 h-4" />

                        {/* Router Status */}
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="flex items-center gap-1.5 cursor-default">
                                    <div className={cn(
                                        "size-4 flex items-center justify-center rounded-full border",
                                        isOnline ? "border-green-500" : "border-red-500"
                                    )}>
                                        <div className={cn(
                                            "size-2 rounded-full animate-pulse",
                                            isOnline ? "bg-green-500" : "bg-red-500"
                                        )} />
                                    </div>
                                    {isOnline
                                        ? <Wifi className="size-4 text-green-500" />
                                        : <WifiOff className="size-4 text-red-500" />
                                    }
                                    <span className={cn(
                                        "text-sm font-semibold hidden sm:block",
                                        isOnline ? "text-green-500" : "text-red-500"
                                    )}>
                    {isOnline ? "Router Online" : "Router Offline"}
                  </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="space-y-1">
                                <p className="font-semibold">MikroTik Status</p>
                                {status?.mikrotik ? (
                                    <>
                                        <p>CPU: {status.mikrotik.cpu?.load ?? 0}%</p>
                                        <p>Memory: {status.mikrotik.memory?.percentUsed ?? 0}%</p>
                                        <p>Sessions: {activeSessions}</p>
                                        <p>Uptime: {formatUptime(status.server?.uptime ?? 0)}</p>
                                    </>
                                ) : (
                                    <p className="text-red-400">Cannot reach router</p>
                                )}
                            </TooltipContent>
                        </Tooltip>

                        <Separator orientation="vertical" className="mx-1 h-4 hidden md:block" />

                        {/* ===== QUICK STATS (hidden on small screens) ===== */}
                        <div className="hidden md:flex items-center gap-3">

                            {/* Active Sessions */}
                            <Tooltip>
                                <TooltipTrigger>
                                    <div
                                        className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
                                        onClick={() => router.push("/sessions")}
                                    >
                                        <Activity className="size-4 text-blue-500" />
                                        <span className="text-sm font-medium">{activeSessions}</span>
                                        <span className="text-xs text-muted-foreground hidden lg:block">sessions</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>{activeSessions} active hotspot session(s)</p>
                                    <p className="text-xs text-muted-foreground">Click to view sessions</p>
                                </TooltipContent>
                            </Tooltip>

                            <Separator orientation="vertical" className="h-4" />

                            {/* Active Subscriptions */}
                            <Tooltip>
                                <TooltipTrigger>
                                    <div
                                        className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
                                        onClick={() => router.push("/subscriptions")}
                                    >
                                        <Users className="size-4 text-purple-500" />
                                        <span className="text-sm font-medium">{activeSubscriptions}</span>
                                        <span className="text-xs text-muted-foreground hidden lg:block">subscribers</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>{activeSubscriptions} active subscription(s)</p>
                                    <p className="text-xs text-muted-foreground">Click to view subscriptions</p>
                                </TooltipContent>
                            </Tooltip>

                            <Separator orientation="vertical" className="h-4" />

                            {/* Revenue Today */}
                            <Tooltip>
                                <TooltipTrigger>
                                    <div
                                        className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
                                        onClick={() => router.push("/payments")}
                                    >
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(revenueToday)}
                    </span>
                                        <span className="text-xs text-muted-foreground hidden lg:block">today</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>Revenue today: {formatCurrency(revenueToday)}</p>
                                    <p className="text-xs text-muted-foreground">Click to view payments</p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Pending Payments Warning */}
                            {pendingPayments > 0 && (
                                <>
                                    <Separator orientation="vertical" className="h-4" />
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Badge
                                                variant="outline"
                                                className="text-yellow-600 border-yellow-400 cursor-pointer hover:bg-yellow-50 text-xs"
                                                onClick={() => router.push("/payments?status=pending")}
                                            >
                                                {pendingPayments} pending
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">
                                            <p>{pendingPayments} payment(s) pending</p>
                                            <p className="text-xs text-muted-foreground">Click to review</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ===== RIGHT: Greeting + Time + Notifications ===== */}
                    <div className="flex items-center gap-3">

                        {/* Greeting + Time */}
                        <div className="hidden sm:flex items-center gap-1.5 text-sm">
                            <span className="text-muted-foreground">{greeting()},</span>
                            <span className="font-semibold">{adminName.split(" ")[0]}</span>
                            <Separator orientation="vertical" className="mx-1 h-4" />
                            <span className="font-mono text-xs text-muted-foreground">
                {getCurrentTime()}
              </span>
                        </div>

                        {/* Notifications Bell */}
                        <div className="relative" ref={notificationRef}>
                            <Button
                                aria-label="View payments"
                                variant="ghost"
                                size="icon"
                                className="relative"
                                onClick={() => setShowNotifications((prev) => !prev)}
                            >
                                <Bell className="size-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 size-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                                )}
                            </Button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 top-10 w-80 bg-background border rounded-xl shadow-lg z-50">

                                    {/* Header */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b">
                                        <h3 className="font-semibold text-sm">Notifications</h3>
                                        <div className="flex items-center gap-2">
                                            {unreadCount > 0 && (
                                                <button
                                                    className="text-xs text-blue-500 hover:underline"
                                                    onClick={markAllAsRead}
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                            <button
                                                className="text-xs text-muted-foreground hover:underline"
                                                onClick={() => {
                                                    setShowNotifications(false)
                                                    router.push("/notifications")
                                                }}
                                            >
                                                View all
                                            </button>
                                        </div>
                                    </div>

                                    {/* List */}
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                                <Bell className="size-8 mb-2 opacity-30" />
                                                <p className="text-sm">No notifications</p>
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    className={cn(
                                                        "px-4 py-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors",
                                                        !notif.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
                                                    )}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        {/* Unread dot */}
                                                        {!notif.isRead && (
                                                            <div className="size-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className={cn(
                                                                "text-xs font-semibold truncate",
                                                                getNotifColor(notif.type)
                                                            )}>
                                                                {notif.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                                {notif.message}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                                {new Date(notif.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </TooltipProvider>
    )
}