"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner"; // adjust if you use a different toast lib

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

export type ActiveSubscription = {
    id: number;
    packageName: string;
    daysRemaining: number;
    isExpiringSoon: boolean;
};

export type User = {
    id: number;
    username: string;
    email: string;
    phoneNumber: string | null;
    fullName: string;
    role: "admin" | "customer" | string;
    isActive: boolean;
    macAddress: string | null;
    ipAddress: string | null;
    createdAt: string;
    updatedAt: string;
    activeSubscription?: ActiveSubscription | null;
    isOnline?: boolean; // derived from live sessions
};

const formatRole = (role: string) =>
    role.charAt(0).toUpperCase() + role.slice(1);

// ==================== HANDLERS PASSED FROM PARENT ====================

export interface UserColumnHandlers {
    onViewProfile: (user: User) => void;
    onEditUser: (user: User) => void;
    onSuspendUser: (user: User) => void;
    onActivateUser: (user: User) => void;
    onDeleteUser: (user: User) => void;
}

export function userColumns(
    handlers: UserColumnHandlers
): ColumnDef<User>[] {
    return [
        {
            accessorKey: "fullName",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Full Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-medium">{row.original.fullName}</div>
            ),
        },
        {
            accessorKey: "username",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Username
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: "phoneNumber",
            header: "Phone Number",
            cell: ({ row }) => row.original.phoneNumber ?? "—",
        },
        {
            accessorKey: "role",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Role
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <Badge variant="secondary">{formatRole(row.original.role)}</Badge>
            ),
        },

        // ==================== STATUS (account + connection) ====================
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => {
                const { isActive, isOnline } = row.original;

                if (!isActive) {
                    return (
                        <Badge
                            className="font-semibold flex items-center space-x-2 py-3 w-fit"
                            variant="outline"
                        >
                            <div className="size-3 flex items-center justify-center rounded-full border border-red-500">
                                <span className="size-1 rounded-full bg-red-500" />
                            </div>
                            <span>Suspended</span>
                        </Badge>
                    );
                }

                if (isOnline) {
                    return (
                        <Badge
                            className="font-semibold flex items-center space-x-2 py-3 w-fit"
                            variant="outline"
                        >
                            <div className="size-3 flex items-center justify-center rounded-full border border-green-500">
                                <span className="size-1 rounded-full bg-green-500 animate-pulse" />
                            </div>
                            <span>Online</span>
                        </Badge>
                    );
                }

                return (
                    <Badge
                        className="font-semibold flex items-center space-x-2 py-3 w-fit"
                        variant="outline"
                    >
                        <div className="size-3 flex items-center justify-center rounded-full border border-yellow-500">
                            <span className="size-1 rounded-full bg-yellow-500" />
                        </div>
                        <span>Active</span>
                    </Badge>
                );
            },
        },

        // ==================== SUBSCRIPTION ====================
        {
            id: "subscription",
            header: "Subscription",
            cell: ({ row }) => {
                const sub = row.original.activeSubscription;

                if (!sub) {
                    return (
                        <span className="text-muted-foreground text-sm">
              No active plan
            </span>
                    );
                }

                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{sub.packageName}</span>
                        <span
                            className={`text-xs ${
                                sub.isExpiringSoon
                                    ? "text-yellow-500"
                                    : "text-muted-foreground"
                            }`}
                        >
              {sub.daysRemaining} day{sub.daysRemaining !== 1 ? "s" : ""} left
            </span>
                    </div>
                );
            },
        },

        {
            accessorKey: "ipAddress",
            header: "IP Address",
            cell: ({ row }) => row.original.ipAddress ?? "Not yet assigned.",
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
                    Joined
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.original.createdAt);
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

        // ==================== ACTIONS ====================
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const user = row.original;

                const handleCopyId = () => {
                    navigator.clipboard.writeText(String(user.id));
                    toast.success("User ID copied");
                };

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

                                <DropdownMenuItem onClick={handleCopyId}>
                                    Copy User ID
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlers.onViewProfile(user)}>
                                    View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlers.onEditUser(user)}>
                                    Edit User
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                {user.isActive ? (
                                    <DropdownMenuItem
                                        onClick={() => handlers.onSuspendUser(user)}
                                    >
                                        Suspend User
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem
                                        onClick={() => handlers.onActivateUser(user)}
                                    >
                                        Reactivate User
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handlers.onDeleteUser(user)}
                                >
                                    Delete User
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}