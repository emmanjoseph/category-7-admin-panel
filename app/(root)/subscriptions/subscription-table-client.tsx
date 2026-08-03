"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SubscriptionDataTable } from "./subscription-data-table"
import { getSubscriptionColumns, Subscription } from "./subscription-column"
import ConfirmDialog from "@/components/confirm-dialog"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {CalendarCheck, CalendarClock, CalendarDays, CalendarMinus2, TriangleAlert} from "lucide-react";

interface Stats {
    total: number
    active: number
    pending: number
    expired: number
    suspended: number
    cancelled: number
}

export function SubscriptionTableClient({
                                            initialSubscriptions,
                                            initialStats,
                                        }: {
    initialSubscriptions: Subscription[]
    initialStats: Stats
}) {
    const router = useRouter()
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions)
    const [stats] = useState<Stats>(initialStats)
    const [confirmAction, setConfirmAction] = useState<{
        type: "suspend" | "cancel"
        sub: Subscription
    } | null>(null)

    const refreshOne = (id: number, patch: Partial<Subscription>) => {
        setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
    }

    const handlers = {
        onViewDetails: useCallback((sub: Subscription) => {
            router.push(`/subscriptions/${sub.id}`)
        }, [router]),

        onSuspend: useCallback((sub: Subscription) => {
            setConfirmAction({ type: "suspend", sub })
        }, []),

        onCancel: useCallback((sub: Subscription) => {
            setConfirmAction({ type: "cancel", sub })
        }, []),

        onReactivate: useCallback(async (sub: Subscription) => {
            try {
                const res = await fetch(`/api/subscriptions/${sub.id}/reactivate`, { method: "POST" })
                const data = await res.json()
                if (!res.ok || !data.success) throw new Error(data.message)

                refreshOne(sub.id, { status: "active" })
                toast.success(`${sub.user.fullName}'s subscription reactivated`)
            } catch (err: any) {
                toast.error(err.message)
            }
        }, []),

        onToggleAutoRenew: useCallback(async (sub: Subscription) => {
            try {
                const res = await fetch(`/api/subscriptions/${sub.id}/toggle-auto-renew`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ autoRenew: !sub.autoRenew }),
                })
                const data = await res.json()
                if (!res.ok || !data.success) throw new Error(data.message)

                refreshOne(sub.id, { autoRenew: !sub.autoRenew })
                toast.success(`Auto-renew ${!sub.autoRenew ? "enabled" : "disabled"}`)
            } catch (err: any) {
                toast.error(err.message)
            }
        }, []),
    }

    const confirmActionExecute = async () => {
        if (!confirmAction) return
        const { type, sub } = confirmAction

        try {
            const res = await fetch(`/api/subscriptions/${sub.id}/${type}`, {
                method: "POST",
                headers: type === "suspend" ? { "Content-Type": "application/json" } : undefined,
                body: type === "suspend" ? JSON.stringify({ reason: "Suspended by admin" }) : undefined,
            })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.message)

            refreshOne(sub.id, { status: type === "suspend" ? "suspended" : "cancelled" })
            toast.success(
                type === "suspend"
                    ? `${sub.user.fullName}'s subscription suspended`
                    : `${sub.user.fullName}'s subscription cancelled`
            )
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setConfirmAction(null)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* ==================== STATS CARDS ==================== */}
            <div className="grid grid-cols-2 gap-4 @xl:grid-cols-5">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-extrabold flex items-center space-x-2"><CalendarDays/><span>{stats.total}</span></CardTitle>
                        <CardDescription>Total subscriptions</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="bg-linear-120 from-emerald-500/10">
                    <CardHeader className="pb-2 ">
                        <CardTitle className="text-green-500 text-2xl font-extrabold flex items-center space-x-2"><CalendarCheck/><span>{stats.active}</span></CardTitle>
                        <CardDescription>Active subscriptions</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="bg-linear-120 from-yellow-500/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl text-yellow-500  font-extrabold flex items-center space-x-2"><CalendarClock/><span>{stats.pending}</span></CardTitle>
                        <CardDescription>Pending</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="bg-linear-120 from-orange-500/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl text-orange-500 font-extrabold flex items-center space-x-2"><CalendarMinus2/><span>{stats.suspended}</span></CardTitle>
                        <CardDescription>Suspended</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="bg-linear-120 from-red-500/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl text-red-500 font-extrabold flex items-center space-x-2"><TriangleAlert/><span>{stats.expired}</span></CardTitle>
                        <CardDescription>Expired</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* ==================== TABLE ==================== */}
            <SubscriptionDataTable
                columns={getSubscriptionColumns(handlers)}
                data={subscriptions}
                searchColumn="customer"
                searchPlaceholder="Search customers..."
            />

            {confirmAction && (
                <ConfirmDialog
                    open={!!confirmAction}
                    title={
                        confirmAction.type === "suspend"
                            ? `Suspend ${confirmAction.sub.user.fullName}'s subscription?`
                            : `Cancel ${confirmAction.sub.user.fullName}'s subscription?`
                    }
                    description={
                        confirmAction.type === "suspend"
                            ? "This disables their hotspot access until reactivated."
                            : "This permanently cancels the subscription. It cannot be reactivated — the customer would need to create a new one."
                    }
                    confirmText={confirmAction.type === "suspend" ? "Suspend" : "Cancel Subscription"}
                    destructive
                    onConfirm={confirmActionExecute}
                    onCancel={() => setConfirmAction(null)}
                />
            )}
        </div>
    )
}