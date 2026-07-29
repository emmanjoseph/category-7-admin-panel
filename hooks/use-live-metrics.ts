"use client"

import { useEffect, useRef, useState } from "react"
import { getSocket } from "@/lib/socket"

export interface LiveDataPoint {
    time: string          // e.g. "14:32:05"
    activeSessions: number
    uploadMbps: number
    downloadMbps: number
    cpuLoad: number
}

const MAX_POINTS = 60   // keep last 60 samples (5min at 5s interval)

export function useLiveMetrics() {
    const [data, setData] = useState<LiveDataPoint[]>([])
    const [connected, setConnected] = useState(false)
    const prevBytesRef = useRef<{ up: number; down: number; time: number } | null>(null)

    useEffect(() => {
        const socket = getSocket()

        socket.on("connect", () => setConnected(true))
        socket.on("disconnect", () => setConnected(false))

        socket.on("system_metrics", (payload) => {
            const now = Date.now()
            const sessions = payload?.mikrotik?.hotspot?.activeSessions ?? 0
            const cpu = payload?.mikrotik?.cpu?.load ?? 0

            // Calculate throughput delta (bytes -> Mbps) if you're sending totalBytes
            let uploadMbps = 0
            let downloadMbps = 0
            const totalUp = payload?.mikrotik?.hotspot?.totalBytesOut ?? null
            const totalDown = payload?.mikrotik?.hotspot?.totalBytesIn ?? null

            if (totalUp !== null && totalDown !== null && prevBytesRef.current) {
                const dt = (now - prevBytesRef.current.time) / 1000 // seconds
                if (dt > 0) {
                    uploadMbps = ((totalUp - prevBytesRef.current.up) * 8) / dt / 1_000_000
                    downloadMbps = ((totalDown - prevBytesRef.current.down) * 8) / dt / 1_000_000
                }
            }
            if (totalUp !== null && totalDown !== null) {
                prevBytesRef.current = { up: totalUp, down: totalDown, time: now }
            }

            const point: LiveDataPoint = {
                time: new Date().toLocaleTimeString("en-US", { hour12: false }),
                activeSessions: sessions,
                uploadMbps: Math.max(0, Number(uploadMbps.toFixed(2))),
                downloadMbps: Math.max(0, Number(downloadMbps.toFixed(2))),
                cpuLoad: cpu,
            }

            setData((prev) => {
                const next = [...prev, point]
                return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next
            })
        })

        return () => {
            socket.off("system_metrics")
            socket.off("connect")
            socket.off("disconnect")
        }
    }, [])

    return { data, connected }
}