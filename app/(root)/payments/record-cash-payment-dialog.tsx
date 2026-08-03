"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup } from "@/components/ui/field"
import { Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function RecordCashPaymentDialog() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        userId: "",
        subscriptionId: "",
        amount: "",
        reference: "",
        notes: "",
    })

    const handleSubmit = async () => {
        if (!form.userId || !form.subscriptionId || !form.amount) {
            toast.error("User, subscription, and amount are required")
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/payments/cash", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: Number(form.userId),
                    subscriptionId: Number(form.subscriptionId),
                    amount: Number(form.amount),
                    reference: form.reference || undefined,
                    notes: form.notes || undefined,
                }),
            })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.message)

            toast.success("Cash payment recorded — subscription activated")
            setOpen(false)
            router.refresh()
            setForm({ userId: "", subscriptionId: "", amount: "", reference: "", notes: "" })
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Record Cash Payment
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Record Cash Payment</DialogTitle>
                    <DialogDescription>
                        For customers who paid in person. This immediately activates their subscription.
                    </DialogDescription>
                </DialogHeader>

                <FieldGroup>
                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <Label>User ID</Label>
                            <Input
                                aria-label={'user id'}
                                type="number"
                                placeholder="2"
                                value={form.userId}
                                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                            />
                        </Field>
                        <Field>
                            <Label>Subscription ID</Label>
                            <Input
                                aria-label={'subscription id'}
                                type="number"
                                placeholder="1"
                                value={form.subscriptionId}
                                onChange={(e) => setForm({ ...form, subscriptionId: e.target.value })}
                            />
                        </Field>
                    </div>

                    <Field>
                        <Label>Amount (KES)</Label>
                        <Input
                            aria-label={'amount'}
                            type="number"
                            placeholder="1500"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        />
                    </Field>

                    <Field>
                        <Label>Reference (optional)</Label>
                        <Input
                            aria-label={'reference'}
                            placeholder="Receipt number"
                            value={form.reference}
                            onChange={(e) => setForm({ ...form, reference: e.target.value })}
                        />
                    </Field>

                    <Field>
                        <Label>Notes (optional)</Label>
                        <Input
                            aria-label={'notes'}
                            placeholder="Paid at office counter"
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        />
                    </Field>
                </FieldGroup>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Record Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}