"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export type Payment = {
    id: number
    userId: number
    amount: string
    phoneNumber: string | null
    paymentMethod: "mpesa" | "cash" | "bank_transfer"
    status: "pending" | "completed" | "failed" | "reversed"
    mpesaReceiptNumber: string | null
    transactionDate: string | null
    paidAt: string | null
    createdAt: string
    userFullName: string | null
    userPhone: string | null
    packageName: string | null
    packagePrice: string | null
}

const statusConfig: Record<
Payment["status"],
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
        pending:   { label: "Pending",   variant: "outline" },
        completed: { label: "Completed", variant: "default" },
        failed:    { label: "Failed",    variant: "destructive" },
        reversed:  { label: "Reversed",  variant: "secondary" },
    }

const methodConfig: Record<Payment["paymentMethod"], string> = {
    mpesa: "M-Pesa",
    cash: "Cash",
    bank_transfer: "Bank Transfer",
}

export const paymentColumns: ColumnDef<Payment>[] = [
    {
        id: "customer",
        header: "Customer",
        accessorFn: (row) => row.userFullName,
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.original.userFullName ?? "Unknown"}</span>
                <span className="text-xs text-muted-foreground">
          {row.original.userPhone ?? row.original.phoneNumber ?? "—"}
        </span>
            </div>
        ),
    },
    {
        accessorKey: "packageName",
        header: "Package",
        cell: ({ row }) => row.original.packageName ?? "—",
    },
    {
        id: "amount",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Amount
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        accessorFn: (row) => Number(row.amount),
        cell: ({ row }) => `KES ${Number(row.original.amount).toLocaleString()}`,
    },
    {
        accessorKey: "paymentMethod",
        header: "Method",
        cell: ({ row }) => (
            <Badge variant="outline">{methodConfig[row.original.paymentMethod]}</Badge>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const config = statusConfig[row.original.status]
            return <Badge variant={config.variant}>{config.label}</Badge>
        },
    },
    {
        accessorKey: "mpesaReceiptNumber",
        header: "Receipt / Ref",
        cell: ({ row }) => (
            <span className="font-mono text-xs">
        {row.original.mpesaReceiptNumber ?? "—"}
      </span>
        ),
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground whitespace-nowrap">
        {new Date(row.original.createdAt).toLocaleString("en-GB", {
            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
        })}
      </span>
        ),
    },
]