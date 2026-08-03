"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Subscription = {
    id: number
    status: "pending" | "active" | "expired" | "suspended" | "cancelled"
    startDate: string
    endDate: string
    autoRenew: boolean
    mikrotikUsername: string | null
    routerId: number | null
    createdAt: string
    updatedAt: string
    user: {
        id: number
        fullName: string
        username: string
        phoneNumber: string
        email: string | null
    }
    package: {
        id: number
        name: string
        price: string
        speed: string
        duration: number
    }
    calculated: {
        daysRemaining: number
        isExpired: boolean
        isExpiringSoon: boolean
    }
}

export interface SubscriptionColumnHandlers {
    onSuspend: (sub: Subscription) => void
    onReactivate: (sub: Subscription) => void
    onCancel: (sub: Subscription) => void
    onToggleAutoRenew: (sub: Subscription) => void
    onViewDetails: (sub: Subscription) => void
}

const statusConfig: Record<
Subscription["status"],
    { label: string; variant: "default" | "secondary" | "destructive" | "outline"; dot: string }
    > = {
        pending:   { label: "Pending",   variant: "outline",     dot: "bg-yellow-500" },
        active:    { label: "Active",    variant: "default",     dot: "bg-green-500" },
        expired:   { label: "Expired",   variant: "secondary",   dot: "bg-muted-foreground" },
        suspended: { label: "Suspended", variant: "destructive", dot: "bg-orange-500" },
        cancelled: { label: "Cancelled", variant: "outline",     dot: "bg-red-500" },
    }

export function getSubscriptionColumns(
    handlers: SubscriptionColumnHandlers
): ColumnDef<Subscription>[] {
    return [
        {
            id: "customer",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Customer
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            accessorFn: (row) => row.user.fullName,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.user.fullName}</span>
                    <span className="text-xs text-muted-foreground">{row.original.user.phoneNumber}</span>
                </div>
            ),
        },
        {
            id: "package",
            header: "Package",
            accessorFn: (row) => row.package.name,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.package.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.package.speed}</span>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const config = statusConfig[row.original.status]
                return (
                    <Badge variant="outline" className="font-semibold flex items-center space-x-2 py-3 w-fit">
                        <span className={`size-1.5 rounded-full ${config.dot}`} />
                        <span>{config.label}</span>
                    </Badge>
                )
            },
        },
        {
            id: "price",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            accessorFn: (row) => Number(row.package.price),
            cell: ({ row }) => `KES ${Number(row.original.package.price).toLocaleString()}`,
        },
        {
            id: "daysRemaining",
            header: "Time Left",
            accessorFn: (row) => row.calculated.daysRemaining,
            cell: ({ row }) => {
                const { daysRemaining, isExpired, isExpiringSoon } = row.original.calculated
                if (isExpired) return <span className="text-muted-foreground text-sm">Expired</span>
                return (
                    <span className={`text-sm ${isExpiringSoon ? "text-yellow-500 font-medium" : ""}`}>
            {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
          </span>
                )
            },
        },
        {
            accessorKey: "autoRenew",
            header: "Auto-Renew",
            cell: ({ row }) => (
                <Badge variant={row.original.autoRenew ? "default" : "outline"}>
                    {row.original.autoRenew ? "On" : "Off"}
                </Badge>
            ),
        },
        {
            accessorKey: "endDate",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Expires
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.original.endDate)
                return (
                    <div className="whitespace-nowrap text-sm">
                        {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                )
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const sub = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className="aria-expanded:bg-muted cursor-pointer">
                            <button className="p-1 rounded hover:bg-muted">
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handlers.onViewDetails(sub)}>
                                    View Details
                                </DropdownMenuItem>
                                {sub.status === "active" && (
                                    <DropdownMenuItem onClick={() => handlers.onToggleAutoRenew(sub)}>
                                        {sub.autoRenew ? "Disable Auto-Renew" : "Enable Auto-Renew"}
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                {sub.status === "active" && (
                                    <DropdownMenuItem onClick={() => handlers.onSuspend(sub)}>
                                        Suspend
                                    </DropdownMenuItem>
                                )}
                                {sub.status === "suspended" && (
                                    <DropdownMenuItem onClick={() => handlers.onReactivate(sub)}>
                                        Reactivate
                                    </DropdownMenuItem>
                                )}
                                {(sub.status === "pending" || sub.status === "active") && (
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => handlers.onCancel(sub)}
                                    >
                                        Cancel Subscription
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
}