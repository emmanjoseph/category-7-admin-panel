"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
 DropdownMenuGroup} from "@/components/ui/dropdown-menu"
import { EllipsisVerticalIcon } from "lucide-react"

export type Router = {
    id: number
    type: string
    name: string
    description: string | null
    location: string | null
    parentRouterId: number | null
    subscriptionId: number | null
    ipAddress: string
    username: string
    port: number
    restPort: number
    status: string
    isActive: boolean
    isPrimary: boolean
    lastHealthCheck: string | null
    lastSync: string | null
    lastSeen: string | null
    consecutiveFailures: number
    uptimeSeconds: number
    createdAt: string
    updatedAt: string
}

const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case "online":
            return "default"
        case "maintenance":
            return "secondary"
        case "offline":
        case "error":
            return "destructive"
        default:
            return "outline"
    }
}

const formatUptime = (seconds: number) => {
    if (!seconds) return "—"
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${h}h ${m}m`
}

export function getRouterColumns(
    onStatusChange: (id: number, status: string) => void,
    onViewDetails: (id: number) => void
): ColumnDef<Router>[] {
    return [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.name}</span>
                    {row.original.location && (
                        <span className="text-xs text-muted-foreground">
                            {row.original.location}
                        </span>
                    )}
                </div>
            ),
            enableHiding: false,
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize px-1.5 text-muted-foreground">
                    {row.original.type}
                </Badge>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={statusVariant(row.original.status)} className="capitalize">
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: "ipAddress",
            header: "IP Address",
            cell: ({ row }) => (
                <span className="font-mono text-sm">{row.original.ipAddress}</span>
            ),
        },
        {
            accessorKey: "isPrimary",
            header: "Primary",
            cell: ({ row }) =>
                row.original.isPrimary ? (
                    <Badge variant="default">Primary</Badge>
                ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                ),
        },
        {
            accessorKey: "uptimeSeconds",
            header: "Uptime",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {formatUptime(row.original.uptimeSeconds)}
                </span>
            ),
        },
        {
            accessorKey: "consecutiveFailures",
            header: "Failures",
            cell: ({ row }) => {
                const failures = row.original.consecutiveFailures
                return failures > 0 ? (
                    <span className="text-sm font-medium text-destructive">{failures}</span>
                ) : (
                    <span className="text-sm text-muted-foreground">0</span>
                )
            },
        },
        {
            accessorKey: "lastSeen",
            header: "Last Seen",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.lastSeen
                        ? new Date(row.original.lastSeen).toLocaleString()
                        : "Never"}
                </span>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const router = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    aria-label={'dropdown'}
                                    variant="ghost"
                                    className="flex size-8 text-muted-foreground data-open:bg-muted"
                                    size="icon"
                                />
                            }
                        >
                            <EllipsisVerticalIcon />
                            <span className="sr-only">Open menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Set status</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onStatusChange(router.id, "online")}>
                                    Online
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onStatusChange(router.id, "maintenance")}>
                                    Maintenance
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onStatusChange(router.id, "offline")}>
                                    Offline
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onViewDetails(router.id)}>
                                    View details
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
}