"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type AuditLog = {
    id: number;
    userId: number | null;
    action: string;
    entityType: string;
    entityId: number | null;
    details: string;
    ipAddress: string | null;
    createdAt: string;
};

const formatText = (text: string) =>
    text
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

export const columns: ColumnDef<AuditLog>[] = [
    {
        accessorKey: "action",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Action
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="font-medium">
                {formatText(row.original.action)}
            </span>
        ),
    },
    {
        accessorKey: "entityType",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Entity
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => formatText(row.original.entityType),
    },
    {
        accessorKey: "details",
        header: "Details",
        cell: ({ row }) => (
            <div className="max-w-md truncate">
                {row.original.details}
            </div>
        ),
    },
    {
        accessorKey: "ipAddress",
        header: "IP Address",
        cell: ({ row }) => row.original.ipAddress ?? "—",
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Created At
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const date = new Date(row.original.createdAt);

            return (
                <div className="whitespace-nowrap">
                    {date.toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                    })}
                </div>
            );
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const log = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                        >
                            <span className="sr-only">
                                Open menu
                            </span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                            Actions
                        </DropdownMenuLabel>

                        <DropdownMenuItem
                            onClick={() =>
                                navigator.clipboard.writeText(
                                    log.id.toString()
                                )
                            }
                        >
                            Copy Log ID
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() =>
                                navigator.clipboard.writeText(
                                    log.details
                                )
                            }
                        >
                            Copy Details
                        </DropdownMenuItem>

                        {log.ipAddress && (
                            <DropdownMenuItem
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        log.ipAddress!
                                    )
                                }
                            >
                                Copy IP Address
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem>
                            View Details
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];