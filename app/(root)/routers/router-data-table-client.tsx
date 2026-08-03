"use client"

import * as React from "react"
import { toast } from "sonner"
import { RouterDataTable } from "@/app/(root)/routers/router-data-table"
import { getRouterColumns, type Router } from "@/app/(root)/routers/router-data-column"
import {RouterDetailsDrawer} from "@/app/(root)/routers/router-details";


const RouterDataTableClient = () => {
    const [routers, setRouters] = React.useState<Router[]>([])
    const [loading, setLoading] = React.useState(true)
    const [detailsOpen, setDetailsOpen] = React.useState(false)
    const [selectedRouterId, setSelectedRouterId] = React.useState<number | null>(null)

    const fetchRouters = React.useCallback(async () => {
        try {
            const res = await fetch("/api/routers", { cache: "no-store" })
            const result = await res.json()
            if (!res.ok) throw new Error(result.message || "Failed to load routers")
            setRouters(result.data.routers)
        } catch (err) {
            console.error(err)
            toast.error("Failed to load routers")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchRouters()
    }, [fetchRouters])

    const handleStatusChange = React.useCallback(async (id: number, status: string) => {
        // optimistic update
        setRouters((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status } : r))
        )

        try {
            const res = await fetch(`/api/routers/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.message || "Failed to update status")
            toast.success(`Router status set to ${status}`)
        } catch (err: any) {
            toast.error(err.message || "Failed to update status")
            // revert on failure
            fetchRouters()
        }
    }, [fetchRouters])

    const handleViewDetails = React.useCallback((id: number) => {
        setSelectedRouterId(id)
        setDetailsOpen(true)
    }, [])

    const columns = React.useMemo(
        () => getRouterColumns(handleStatusChange, handleViewDetails),
        [handleStatusChange, handleViewDetails]
    )

    if (loading) {
        return <div className="px-1 text-sm text-muted-foreground">Loading routers...</div>
    }

    return (
        <>
            <RouterDataTable columns={columns} data={routers} />

            <RouterDetailsDrawer
                routerId={selectedRouterId}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            />
        </>
    )
}

export default RouterDataTableClient