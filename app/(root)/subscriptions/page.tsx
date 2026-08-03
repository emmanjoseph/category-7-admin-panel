import React from 'react'
import { getSubscriptions, getSubscriptionStats } from "@/lib/api"
import { SubscriptionTableClient } from "@/app/(root)/subscriptions/subscription-table-client"

const Subscriptions = async () => {
    const [subscriptionsRes, statsRes] = await Promise.all([
        getSubscriptions({ limit: 50 }),
        getSubscriptionStats(),
    ])

    const initialSubscriptions = subscriptionsRes?.data?.subscriptions || []
    const initialStats = statsRes?.data?.stats || statsRes?.data || {
        total: 0,
        active: 0,
        pending: 0,
        expired: 0,
        suspended: 0,
        cancelled: 0,
    }

    return (
        <div className={'@container/main flex flex-1 flex-col gap-2'}>
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <h1 className="text-base font-bold">Subscriptions</h1>

                <SubscriptionTableClient
                    initialSubscriptions={initialSubscriptions}
                    initialStats={initialStats}
                />
            </div>
        </div>
    )
}

export default Subscriptions