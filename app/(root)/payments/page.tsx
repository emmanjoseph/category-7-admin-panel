import React from 'react'
import { getPayments, getPaymentStats } from "@/lib/api"
import { PaymentTableClient } from "@/app/(root)/payments/payment-table-client"

const Payments = async () => {
    const [paymentsRes, statsRes] = await Promise.all([
        getPayments({ limit: 50 }),
        getPaymentStats(),
    ])

    return (
        <div className={'@container/main flex flex-1 flex-col gap-2'}>
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <h1 className="text-base font-bold">Payments</h1>

                <PaymentTableClient
                    payments={paymentsRes.data.payments}
                    stats={statsRes.data.statistics}
                />
            </div>
        </div>
    )
}

export default Payments