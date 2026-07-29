"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    ArrowLeft,
    Wifi,
    Router as RouterIcon,
    CreditCard,
    Clock,
    Loader2,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import ConfirmDialog from "@/components/confirm-dialog"

interface SubscriptionDetail {
    id: number
    status: string
    startDate: string
    endDate: string
    autoRenew: boolean
    mikrotikUsername: string | null
    mikrotikPassword: string | null
    routerId: number | null
    createdAt: string
    user: {
        id: number
        fullName: string
        username: string
        phoneNumber: string
        email: string | null
        isActive: boolean
    }
    package: {
        id: number
        name: string
        description: string | null
        price: string
        speed: string
        downloadSpeed: number
        uploadSpeed: number
        duration: number
        dataLimit: string | number
    }
    calculated: {
        daysRemaining: number
        daysElapsed: number
        daysTotal: number
        percentageUsed: number
        isExpired: boolean
        isExpiringSoon: boolean
        expiryDate: string
        renewalMessage: string
    }
}

interface Payment {
    id: number
    amount: string
    status: string
    paymentMethod: string
    mpesaReceiptNumber: string | null
    paidAt: string | null
    createdAt: string
}

interface SessionRow {
    id: number
    macAddress: string
    ipAddress: string
    startTime: string
    endTime: string | null
    status: string
    uploadBytes: number
    downloadBytes: number
}

const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case "active": return "default"
        case "pending": return "outline"
        case "suspended": return "destructive"
        case "expired": return "secondary"
        case "cancelled": return "outline"
        default: return "outline"
    }
}

function formatBytes(bytes: number) {
    if (!bytes) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export function SubscriptionDetailClient({
                                             subscription,
                                             payments,
                                             sessions,
                                         }: {
    subscription: SubscriptionDetail
    payments: Payment[]
    sessions: SessionRow[]
}) {
    const router = useRouter()
    const [confirmAction, setConfirmAction] = useState<"suspend" | "cancel" | null>(null)
    const [upgradeOpen, setUpgradeOpen] = useState(false)
    const [upgrading, setUpgrading] = useState(false)
    const [newPackageId, setNewPackageId] = useState("")

    const sub = subscription

    const handleSuspend = async () => {
        try {
            const res = await fetch(`/api/subscriptions/${sub.id}/suspend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: "Suspended by admin" }),
            })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.message)
            toast.success("Subscription suspended")
            router.refresh()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setConfirmAction(null)
        }
    }

    const handleCancel = async () => {
        try {
            const res = await fetch(`/api/subscriptions/${sub.id}/cancel`, { method: "POST" })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.message)
            toast.success("Subscription cancelled")
            router.refresh()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setConfirmAction(null)
        }
    }

    const handleReactivate = async () => {
        try {
            const res = await fetch(`/api/subscriptions/${sub.id}/reactivate`, { method: "POST" })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.message)
            toast.success("Subscription reactivated")
            router.refresh()
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    const handleUpgrade = async () => {
        if (!newPackageId) {
            toast.error("Select a package")
            return
        }
        setUpgrading(true)
        try {
            const res = await fetch(`/api/subscriptions/${sub.id}/upgrade`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPackageId: Number(newPackageId) }),
            })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.message)

            toast.success(data.message || "Upgrade initiated — customer must pay to activate")
            setUpgradeOpen(false)
            router.refresh()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setUpgrading(false)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* ==================== HEADER ==================== */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/subscriptions">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold">{sub.user.fullName}</h1>
                        <p className="text-sm text-muted-foreground">{sub.user.phoneNumber}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(sub.status)} className="capitalize">
                        {sub.status}
                    </Badge>

                    {sub.status === "active" && (
                        <>
                            <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">Upgrade Package</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Upgrade subscription</DialogTitle>
                                        <DialogDescription>
                                            Remaining {sub.calculated.daysRemaining} day(s) will carry over to the new plan.
                                            Customer will need to pay to activate the upgraded subscription.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Select value={newPackageId} onValueChange={setNewPackageId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select new package" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* Populate this from GET /api/packages — passed as a prop if you want */}
                                            <SelectItem value="1">Bronze</SelectItem>
                                            <SelectItem value="2">Silver</SelectItem>
                                            <SelectItem value="3">Gold</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setUpgradeOpen(false)}>Cancel</Button>
                                        <Button onClick={handleUpgrade} disabled={upgrading}>
                                            {upgrading && <Loader2 className="mr-2 size-4 animate-spin" />}
                                            Confirm Upgrade
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Button variant="outline" size="sm" onClick={() => setConfirmAction("suspend")}>
                                Suspend
                            </Button>
                        </>
                    )}

                    {sub.status === "suspended" && (
                        <Button variant="outline" size="sm" onClick={handleReactivate}>
                            Reactivate
                        </Button>
                    )}

                    {(sub.status === "pending" || sub.status === "active") && (
                        <Button variant="destructive" size="sm" onClick={() => setConfirmAction("cancel")}>
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            {/* ==================== SUMMARY CARDS ==================== */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <Wifi className="size-4" /> Package
                        </CardDescription>
                        <CardTitle className="text-xl">{sub.package.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        {sub.package.speed} · KES {sub.package.price} / {sub.package.duration} days
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <Clock className="size-4" /> Time Remaining
                        </CardDescription>
                        <CardTitle className="text-xl">
                            {sub.calculated.isExpired ? "Expired" : `${sub.calculated.daysRemaining} days`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        {sub.calculated.renewalMessage}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <RouterIcon className="size-4" /> Hotspot Credentials
                        </CardDescription>
                        <CardTitle className="text-base font-mono">
                            {sub.mikrotikUsername || "Not yet assigned"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        {sub.routerId ? `Router #${sub.routerId}` : "No router linked"}
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* ==================== PAYMENT HISTORY ==================== */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="size-4" /> Payment History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground h-20">
                                        No payments yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell>KES {Number(p.amount).toLocaleString()}</TableCell>
                                        <TableCell className="capitalize">{p.paymentMethod}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    p.status === "completed" ? "default"
                                                        : p.status === "failed" ? "destructive"
                                                            : "outline"
                                                }
                                                className="capitalize"
                                            >
                                                {p.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {p.mpesaReceiptNumber || "—"}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(p.createdAt).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* ==================== SESSION HISTORY ==================== */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Wifi className="size-4" /> Session History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>IP Address</TableHead>
                                <TableHead>MAC Address</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Data Used</TableHead>
                                <TableHead>Started</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sessions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground h-20">
                                        No sessions yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sessions.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-mono text-xs">{s.ipAddress}</TableCell>
                                        <TableCell className="font-mono text-xs">{s.macAddress}</TableCell>
                                        <TableCell>
                                            <Badge variant={s.status === "active" ? "default" : "outline"} className="capitalize">
                                                {s.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {formatBytes(s.uploadBytes + s.downloadBytes)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(s.startTime).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {confirmAction && (
                <ConfirmDialog
                    open={!!confirmAction}
                    title={
                        confirmAction === "suspend"
                            ? `Suspend ${sub.user.fullName}'s subscription?`
                            : `Cancel ${sub.user.fullName}'s subscription?`
                    }
                    description={
                        confirmAction === "suspend"
                            ? "This disables their hotspot access until reactivated."
                            : "This permanently cancels the subscription. It cannot be reactivated."
                    }
                    confirmText={confirmAction === "suspend" ? "Suspend" : "Cancel Subscription"}
                    destructive
                    onConfirm={confirmAction === "suspend" ? handleSuspend : handleCancel}
                    onCancel={() => setConfirmAction(null)}
                />
            )}
        </div>
    )
}