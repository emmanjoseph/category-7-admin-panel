import React from 'react'
import {getAudits} from "@/lib/api";
import {columns} from "@/app/(root)/audit-logs/columns";
import {DataTable} from "@/app/(root)/audit-logs/data-table";

const AuditLogs = async () => {
    const audits = await getAudits();
    return (
        <div className={'@container/main flex flex-1 flex-col gap-2'}>
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <h1 className="text-base font-bold">
                    Audit Logs
                </h1>

                <DataTable
                    columns={columns}
                    data={audits.data.logs}
                />
            </div>
            </div>
    )
}
export default AuditLogs
