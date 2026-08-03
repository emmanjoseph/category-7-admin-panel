"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"
import { UserDataTable } from "@/app/(root)/users/user-data-table" // reuse generic table
import { getVoucherColumns, Voucher } from "./voucher-column"
import ConfirmDialog from "@/components/confirm-dialog"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import {CreateVoucherDialog} from "@/components/create-voucher-dialog";
import {HandCoins, TicketCheck, TicketIcon, TicketSlash, TicketX} from "lucide-react";

interface Tier {
    key: string
    label: string
    durationMinutes: number
}

interface Stats {
    total: number
    unused: number
    used: number
    expired: number
    revenue: number
}

export function VouchersTableClient({
                                        initialVouchers,
                                        initialStats,
                                        tiers,
                                    }: {
    initialVouchers: Voucher[]
    initialStats: Stats
    tiers: Tier[]
}) {
    const router = useRouter()
    const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers)
    const [stats, setStats] = useState<Stats>(initialStats)
    const [confirmDelete, setConfirmDelete] = useState<Voucher | null>(null)

    const refresh = useCallback(() => {
        router.refresh() // re-runs the server component fetch
    }, [router])

    const handlers = {
        onDeleteVoucher: useCallback((voucher: Voucher) => {
            setConfirmDelete(voucher)
        }, []),
    }

    const confirmDeleteVoucher = async () => {
        if (!confirmDelete) return
        try {
            const res = await fetch(`/api/vouchers/${confirmDelete.id}`, {
                method: "DELETE",
            })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.message)

            setVouchers((prev) => prev.filter((v) => v.id !== confirmDelete.id))
            toast.success(`Voucher ${confirmDelete.code} deleted`)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setConfirmDelete(null)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* ==================== STATS CARDS ==================== */}
            <div className="grid grid-cols-2 gap-4 @xl:grid-cols-5">
                <Card className="bg-linear-120 from-card/50 to-transparent drop-shadow-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-extrabold flex items-center space-x-3"><TicketIcon/><span>{stats.total}</span></CardTitle>
                        <CardDescription>Total Vouchers</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="bg-linear-120 from-green-500/5 to-card/5 drop-shadow-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-extrabold text-green-500 flex items-center space-x-3"><TicketCheck/><span>{stats.unused}</span></CardTitle>
                        <CardDescription>Unused vouchers</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="bg-linear-120 from-blue-500/5 drop-shadow-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl text-blue-500 font-extrabold flex items-center space-x-3"><TicketSlash/> <span>{stats.used}</span></CardTitle>
                        <CardDescription>Used vouchers</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="bg-linear-120 from-red-500/5 drop-shadow-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-extrabold text-red-500 flex items-center space-x-3"><TicketX /><span>{stats.expired.toLocaleString()}</span></CardTitle>
                        <CardDescription>Expired vouchers</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="bg-linear-120 from-yellow-500/5 drop-shadow-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl  font-extrabold text-yellow-500 flex items-center space-x-3"><HandCoins/><span>KES {stats.revenue.toLocaleString()}</span></CardTitle>
                        <CardDescription>Revenue</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* ==================== CREATE ACTION ==================== */}
            <div className="flex justify-end">
                <CreateVoucherDialog tiers={tiers} onCreated={refresh} />
            </div>

            {/* ==================== TABLE ==================== */}
            <UserDataTable columns={getVoucherColumns(handlers)} data={vouchers} />

            {confirmDelete && (
                <ConfirmDialog
                    open={!!confirmDelete}
                    title={`Delete voucher ${confirmDelete.code}?`}
                    description="This removes the voucher and disables its hotspot access. This cannot be undone."
                    confirmText="Delete"
                    destructive
                    onConfirm={confirmDeleteVoucher}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}
        </div>
    )
}