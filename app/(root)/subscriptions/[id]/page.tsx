import { notFound } from "next/navigation"
import {
    getSubscriptionById,
    getSubscriptionPayments,
    getSubscriptionSessions,
} from "@/lib/api"
import { SubscriptionDetailClient } from "./subscription-detail-client"

export default async function SubscriptionDetailPage({
                                                         params,
                                                     }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const [subRes, paymentsRes, sessionsRes] = await Promise.all([
        getSubscriptionById(id),
        getSubscriptionPayments(id),
        getSubscriptionSessions(id),
    ])

    if (!subRes.success) {
        notFound()
    }

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <SubscriptionDetailClient
                    subscription={subRes.data.subscription}
                    payments={paymentsRes.data?.payments ?? []}
                    sessions={sessionsRes.data?.sessions ?? []}
                />
            </div>
        </div>
    )
}