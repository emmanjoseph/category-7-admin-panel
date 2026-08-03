import React from 'react'
import { getVouchers, getVoucherStats, getVoucherTiers } from "@/lib/api"
import { VouchersTableClient } from "@/app/(root)/vouchers/vouchers-table-client"

const Vouchers = async () => {
    const [vouchersRes, statsRes, tiersRes] = await Promise.all([
        getVouchers(),
        getVoucherStats(),
        getVoucherTiers(),
    ])

    return (
        <div className={'@container/main flex flex-1 flex-col gap-2'}>
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <h1 className="text-base font-bold">Vouchers</h1>

                <VouchersTableClient
                    initialVouchers={vouchersRes.data.vouchers}
                    initialStats={statsRes.data}
                    tiers={tiersRes.data.tiers}
                />
            </div>
        </div>
    )
}

export default Vouchers