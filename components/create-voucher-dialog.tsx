"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"

interface Tier {
    key: string
    label: string
    durationMinutes: number
}

interface CreateVoucherDialogProps {
    tiers: Tier[]
    onCreated: () => void
}

export function CreateVoucherDialog({ tiers, onCreated }: CreateVoucherDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        quantity: 1,
        price: "",
        speed: "",
        downloadSpeed: "",
        uploadSpeed: "",
        tierKey: "1hr",
        expiresInDays: 30,
    })

    const selectedTier = tiers.find((t) => t.key === form.tierKey)

    const handleSubmit = async () => {
        if (!form.price || !form.speed || !form.downloadSpeed || !form.uploadSpeed) {
            toast.error("Fill in all fields")
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/vouchers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    quantity: Number(form.quantity),
                    price: Number(form.price),
                    speed: form.speed,
                    downloadSpeed: Number(form.downloadSpeed),
                    uploadSpeed: Number(form.uploadSpeed),
                    durationMinutes: selectedTier?.durationMinutes,
                    expiresInDays: Number(form.expiresInDays),
                }),
            })
            const data = await res.json()

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to create voucher(s)")
            }

            toast.success(
                form.quantity > 1
                    ? `${data.data.count} vouchers created`
                    : "Voucher created"
            )
            setOpen(false)
            onCreated()

            setForm({
                quantity: 1,
                price: "",
                speed: "",
                downloadSpeed: "",
                uploadSpeed: "",
                tierKey: "1hr",
                expiresInDays: 30,
            })
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger >
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Voucher
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Voucher(s)</DialogTitle>
                    <DialogDescription>
                        Create a single voucher or a batch for bulk printing/selling.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                            <Label>Quantity</Label>
                            <Input
                                aria-label={'Quantity of vouchers to create'}
                                type="number"
                                min={1}
                                max={500}
                                value={form.quantity}
                                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Price (KES)</Label>
                            <Input
                                aria-label={'Price of the voucher'}
                                type="number"
                                placeholder="50"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid gap-1.5">
                        <Label>Duration</Label>
                        <Select
                            value={form.tierKey}
                            onValueChange={(value) => setForm({ ...form, tierKey: value ?? "" })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                                {tiers.map((tier) => (
                                    <SelectItem key={tier.key} value={tier.key}>
                                        {tier.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-1.5">
                            <Label>Speed Label</Label>
                            <Input
                                aria-label={'Speed label for the voucher'}
                                placeholder="5 Mbps"
                                value={form.speed}
                                onChange={(e) => setForm({ ...form, speed: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Download (Kbps)</Label>
                            <Input
                                aria-label={'Download speed for the voucher'}
                                type="number"
                                placeholder="5120"
                                value={form.downloadSpeed}
                                onChange={(e) => setForm({ ...form, downloadSpeed: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Upload (Kbps)</Label>
                            <Input
                                aria-label={'Upload speed for the voucher'}
                                type="number"
                                placeholder="2048"
                                value={form.uploadSpeed}
                                onChange={(e) => setForm({ ...form, uploadSpeed: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid gap-1.5">
                        <Label>Code expires in (days)</Label>
                        <Input
                            aria-label={'Number of days the code is valid for'}
                            type="number"
                            value={form.expiresInDays}
                            onChange={(e) => setForm({ ...form, expiresInDays: Number(e.target.value) })}
                        />
                        <p className="text-xs text-muted-foreground">
                            How long the unused code stays redeemable — separate from the
                            internet session duration above.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {form.quantity > 1 ? `Create ${form.quantity} Vouchers` : "Create Voucher"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
