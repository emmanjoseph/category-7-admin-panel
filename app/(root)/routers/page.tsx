import React from 'react'
import RouterDataTableClient from "@/app/(root)/routers/router-data-table-client"

const Page = () => {
    return (
        <div className={'@container/main flex flex-1 flex-col gap-2'}>
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <h1 className="text-base font-bold">Routers</h1>
                <RouterDataTableClient />
            </div>
        </div>
    )
}
export default Page