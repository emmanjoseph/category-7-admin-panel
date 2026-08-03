"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useLiveMetrics } from "@/hooks/use-live-metrics"
import {
  Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"

const chartConfig = {
  downloadMbps: { label: "Download (Mbps)", color: "var(--primary)" },
  uploadMbps: { label: "Upload (Mbps)", color: "var(--secondary)" },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const { data, connected } = useLiveMetrics()

  const latest = data[data.length - 1]

  return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className={'font-bold'}>Live Network Traffic</CardTitle>
          <CardDescription>
          <span className="hidden @[540px]/card:block">
            Real-time bandwidth from MikroTik hotspot
          </span>
            <span className="@[540px]/card:hidden">Live traffic</span>
          </CardDescription>
          <CardAction className={'flex items-center'}>
            <Badge variant={connected ? "default" : "destructive"} className="gap-1.5">
              <span className={`size-1.5 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
              {connected ? "Live" : "Disconnected"}
            </Badge>
            {latest && (
                <span className="ml-2 text-sm text-muted-foreground font-bold">
              {latest.activeSessions} active session{latest.activeSessions !== 1 ? "s" : ""}
            </span>
            )}
          </CardAction>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[252px] w-full">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillDownload" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-downloadMbps)" stopOpacity={1.0} />
                  <stop offset="95%" stopColor="var(--color-downloadMbps)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillUpload" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-uploadMbps)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-uploadMbps)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Area
                  dataKey="uploadMbps"
                  type="natural"
                  fill="url(#fillUpload)"
                  stroke="var(--color-uploadMbps)"
                  stackId="a"
                  isAnimationActive={false}
              />
              <Area
                  dataKey="downloadMbps"
                  type="natural"
                  fill="url(#fillDownload)"
                  stroke="var(--color-downloadMbps)"
                  stackId="a"
                  isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
  )
}