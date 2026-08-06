"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Voucher = {
    id: number;
    code: string;
    price: string;
    speed: string;
    downloadSpeed: number;
    uploadSpeed: number;
    durationMinutes: number;
    durationLabel: string;
    status: "unused" | "used" | "expired";
    usedBy: number | null;
    usedAt: string | null;
    expiresAt: string;
    createdAt: string;
};

export interface VoucherColumnHandlers {
    onDeleteVoucher: (voucher: Voucher) => void;
}

const statusConfig = {
    unused: { label: "Unused", color: "border-green-500 bg-green-500" },
    used: { label: "Used", color: "border-blue-500 bg-blue-500" },
    expired: { label: "Expired", color: "border-red-500 bg-red-500" },
};

export function getVoucherColumns(
    handlers: VoucherColumnHandlers
): ColumnDef<Voucher>[] {
    return [
        {
            accessorKey: "code",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Code
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const code = row.original.code;
                return (
                    <div className="flex items-center gap-2 font-mono font-medium">
                        {code}
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(code);
                                toast.success("Code copied");
                            }}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Copy className="h-3.5 w-3.5" />
                        </button>
                    </div>
                );
            },
        },
        {
            accessorKey: "speed",
            header: "Speed",
        },
        {
            accessorKey: "durationLabel",
            header: "Duration",
            cell: ({ row }) => (
                <span className="whitespace-nowrap">
          {row.original.durationLabel}
        </span>
            ),
        },
        {
            accessorKey: "price",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => `KES ${row.original.price}`,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                const config = statusConfig[status];
                return (
                    <Badge
                        className="font-semibold flex items-center space-x-2 py-3 w-fit"
                        variant="outline"
                    >
                        <div
                            className={`size-3 flex items-center justify-center rounded-full border ${config.color.split(" ")[0]}`}
                        >
                            <span className={`size-1 rounded-full ${config.color.split(" ")[1]}`} />
                        </div>
                        <span>{config.label}</span>
                    </Badge>
                );
            },
        },
        {
            accessorKey: "expiresAt",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Expires
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.original.expiresAt);
                return (
                    <div className="whitespace-nowrap">
                        {date.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        })}
                    </div>
                );
            },
        },
        {
            accessorKey: "usedAt",
            header: "Used At",
            cell: ({ row }) => {
                if (!row.original.usedAt) return "—";
                return new Date(row.original.usedAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                });
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const voucher = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className="aria-expanded:bg-muted cursor-pointer"
                        >
                            <button className="p-1 rounded hover:bg-muted">
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => {
                                        navigator.clipboard.writeText(voucher.code);
                                        toast.success("Code copied");
                                    }}
                                >
                                    Copy Code
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                            {voucher.status !== "used" && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() => handlers.onDeleteVoucher(voucher)}
                                        >
                                            Delete Voucher
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}