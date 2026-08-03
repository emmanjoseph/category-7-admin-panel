"use client"

import { useEffect, useState } from "react"
import { Loader2, Wifi, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Tier {
    key: string
    label: string
    durationMinutes: number
    price: number
}

type Step = "loading-tiers" | "select-tier" | "enter-phone" | "waiting-payment" | "success" | "failed" | "site-unavailable"

export function HotspotPurchaseFlow({
                                        siteId,
                                        mac,
                                        deviceIp,
                                        mikrotikLoginUrl,
                                    }: {
    siteId: string | null
    mac: string | null
    deviceIp: string | null
    mikrotikLoginUrl: string | null
}) {
    const [step, setStep] = useState<Step>("loading-tiers")
    const [tiers, setTiers] = useState<Tier[]>([])
    const [selectedTier, setSelectedTier] = useState<Tier | null>(null)
    const [phoneNumber, setPhoneNumber] = useState("")
    const [paymentId, setPaymentId] = useState<number | null>(null)
    const [voucherCode, setVoucherCode] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [autoSubmitting, setAutoSubmitting] = useState(false)

    // ==================== LOAD PRICING ====================
    useEffect(() => {
        if (!siteId) {
            setError("Missing site information. Please reconnect to WiFi and try again.")
            setStep("site-unavailable")
            return
        }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vouchers/pricing?siteId=${siteId}`)
            .then((res) => res.json())
            .then((data) => {
                if (!data.success) {
                    setError(data.message || "This location is temporarily unavailable")
                    setStep("site-unavailable")
                    return
                }
                setTiers(data.data.tiers)
                setStep("select-tier")
            })
            .catch(() => {
                setError("Could not load pricing. Please check your connection and try again.")
                setStep("site-unavailable")
            })
    }, [siteId])

    // ==================== POLL PAYMENT STATUS ====================
    useEffect(() => {
        if (step !== "waiting-payment" || !paymentId) return

        const interval = setInterval(async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/vouchers/purchase/${paymentId}/status`
                )
                const data = await res.json()

                if (data.data.status === "completed") {
                    clearInterval(interval)
                    setVoucherCode(data.data.code)
                    setStep("success")
                } else if (data.data.status === "failed") {
                    clearInterval(interval)
                    setError(data.data.error || "Payment failed")
                    setStep("failed")
                }
                // status === "pending" → keep polling
            } catch {
                // network hiccup — keep polling, don't fail immediately
            }
        }, 3000)

        // Stop polling after 90s regardless — don't poll forever
        const timeout = setTimeout(() => {
            clearInterval(interval)
            if (step === "waiting-payment") {
                setError("Payment is taking longer than expected. Check your M-Pesa messages.")
                setStep("failed")
            }
        }, 90000)

        return () => {
            clearInterval(interval)
            clearTimeout(timeout)
        }
    }, [step, paymentId])

    // ==================== AUTO-SUBMIT TO MIKROTIK ONCE CODE IS READY ====================
    useEffect(() => {
        if (step !== "success" || !voucherCode || !mikrotikLoginUrl) return

        setAutoSubmitting(true)

        // MikroTik's own login endpoint accepts username/password as form POST.
        // We submit a hidden form directly to the router's link_login URL —
        // this works because the customer's device IS on that network right now.
        const form = document.createElement("form")
        form.method = "POST"
        form.action = mikrotikLoginUrl
        form.style.display = "none"

        const userField = document.createElement("input")
        userField.name = "username"
        userField.value = voucherCode
        form.appendChild(userField)

        const passField = document.createElement("input")
        passField.name = "password"
        passField.value = voucherCode
        form.appendChild(passField)

        document.body.appendChild(form)

        // Small delay so the success screen is visible before redirect happens
        const timer = setTimeout(() => form.submit(), 2000)
        return () => clearTimeout(timer)
    }, [step, voucherCode, mikrotikLoginUrl])

    const handleSelectTier = (tier: Tier) => {
        setSelectedTier(tier)
        setStep("enter-phone")
    }

    const handlePurchase = async () => {
        if (!selectedTier || !phoneNumber || !siteId) return

        if (!phoneNumber.startsWith("254") || phoneNumber.length !== 12) {
            setError("Phone number must be in format 254XXXXXXXXX")
            return
        }

        setError(null)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vouchers/purchase`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    siteId: parseInt(siteId),
                    tierKey: selectedTier.key,
                    phoneNumber,
                }),
            })
            const data = await res.json()

            if (!res.ok || !data.success) {
                setError(data.message || "Failed to start payment")
                return
            }

            setPaymentId(data.data.paymentId)
            setStep("waiting-payment")
        } catch {
            setError("Network error. Please try again.")
        }
    }

    // ==================== RENDER ====================

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-6 text-center">
                    <Wifi className="size-10 mb-2" />
                    <h1 className="text-xl font-bold">Get Connected</h1>
                    <p className="text-sm text-muted-foreground">Choose a plan and pay with M-Pesa</p>
                </div>

                {step === "loading-tiers" && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="size-8 animate-spin" />
                    </div>
                )}

                {step === "site-unavailable" && (
                    <Card>
                        <CardContent className="pt-6 text-center space-y-2">
                            <XCircle className="size-10 mx-auto text-destructive" />
                            <p className="text-sm">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {step === "select-tier" && (
                    <div className="grid grid-cols-1 gap-3">
                        {tiers.map((tier) => (
                            <Card
                                key={tier.key}
                                className="cursor-pointer hover:border-primary transition-colors"
                                onClick={() => handleSelectTier(tier)}
                            >
                                <CardContent className="flex items-center justify-between py-4">
                                    <div>
                                        <p className="font-semibold">{tier.label}</p>
                                        <p className="text-xs text-muted-foreground">Unlimited browsing</p>
                                    </div>
                                    <p className="text-lg font-bold">KES {tier.price}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {step === "enter-phone" && selectedTier && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">{selectedTier.label} — KES {selectedTier.price}</CardTitle>
                            <CardDescription>Enter your M-Pesa phone number</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Phone Number</Label>
                                <Input
                                    placeholder="254712345678"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    inputMode="numeric"
                                    aria-label={'Phone number'}
                                />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => setStep("select-tier")}>
                                    Back
                                </Button>
                                <Button className="flex-1" onClick={handlePurchase}>
                                    Pay KES {selectedTier.price}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === "waiting-payment" && (
                    <Card>
                        <CardContent className="pt-6 text-center space-y-3">
                            <Loader2 className="size-10 mx-auto animate-spin" />
                            <p className="font-medium">Check your phone</p>
                            <p className="text-sm text-muted-foreground">
                                Enter your M-Pesa PIN to complete payment
                            </p>
                        </CardContent>
                    </Card>
                )}

                {step === "success" && voucherCode && (
                    <Card>
                        <CardContent className="pt-6 text-center space-y-3">
                            <CheckCircle2 className="size-10 mx-auto text-green-500" />
                            <p className="font-medium">Payment successful!</p>

                            {autoSubmitting ? (
                                <p className="text-sm text-muted-foreground">Connecting you automatically...</p>
                            ) : (
                                <>
                                    <p className="text-sm text-muted-foreground">
                                        If you're not connected automatically, enter this code as both
                                        username and password on the login page:
                                    </p>
                                    <p className="text-2xl font-mono font-bold tracking-wider bg-muted rounded-lg py-3">
                                        {voucherCode}
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {step === "failed" && (
                    <Card>
                        <CardContent className="pt-6 text-center space-y-3">
                            <XCircle className="size-10 mx-auto text-destructive" />
                            <p className="font-medium">Payment didn't go through</p>
                            <p className="text-sm text-muted-foreground">{error}</p>
                            <Button onClick={() => { setStep("select-tier"); setError(null) }}>
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}