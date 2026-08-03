"use client"
import { useEffect, useState } from "react"
import { getSocket } from "@/lib/socket"

export function useDashboardMetrics() {
    const [metrics, setMetrics] = useState<any>(null)

    useEffect(() => {
        const socket = getSocket()
        socket.on("system_metrics", (payload) => setMetrics(payload))
        return () => { socket.off("system_metrics") }
    }, [])

    return metrics
}