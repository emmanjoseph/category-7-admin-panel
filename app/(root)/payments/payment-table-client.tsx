"use client"

import { paymentColumns, Payment } from "./payment-column"
import { RecordCashPaymentDialog } from "./record-cash-payment-dialog"
import { SubscriptionDataTable } from "@/app/(root)/subscriptions/subscription-data-table"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {Banknote, BanknoteCheck, BanknoteX} from "lucide-react";

interface Stats {
    total: { count: number; amount: number }
    completed: { count: number; amount: number }
    pending: { count: number }
    failed: { count: number }
}

export function PaymentTableClient({
                                       payments,
                                       stats,
                                   }: {
    payments: Payment[]
    stats: Stats
}) {
    return (
        <div className="flex flex-col gap-6">
            {/* ==================== STATS CARDS ==================== */}
            <div className="grid grid-cols-2 gap-4 @xl:grid-cols-4">
                <Card className="bg-card">
                    <CardHeader className="pb-2">
                        <CardDescription>Total Revenue</CardDescription>
                        <CardTitle className="text-2xl font-extrabold">KES {stats.total.amount.toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-linear-120 from-emerald-500/10 to-card drop-shadow-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl text-green-500 font-extrabold flex items-center space-x-2">
                            <BanknoteCheck size={30}/>
                            <span>{stats.completed.count}</span></CardTitle>
                        <CardDescription>Completed payments</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="bg-linear-120 from-yellow-500/10 to-card drop-shadow-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl text-yellow-500 font-extrabold flex items-center space-x-2">
                            <Banknote size={30}/>
                            <span>{stats.pending.count}</span></CardTitle>
                        <CardDescription>Pending payments</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="bg-linear-120 from-red-500/10 to-card drop-shadow-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl text-red-500 font-extrabold flex items-center space-x-2">
                            <BanknoteX size={30}/>
                            <span>{stats.failed.count}</span>
                        </CardTitle>
                        <CardDescription>Failed payments</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <div className="flex justify-end">
                <RecordCashPaymentDialog />
            </div>

            <SubscriptionDataTable
                columns={paymentColumns}
                data={payments}
                searchColumn="customer"
                searchPlaceholder="Search customers..."
            />
        </div>
    )
}