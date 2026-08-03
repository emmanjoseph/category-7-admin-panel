"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics"
import { Skeleton } from "@/components/ui/skeleton"

export function SectionCards() {
  const metrics = useDashboardMetrics()

  const revenue = metrics?.revenue?.thisMonth ?? 0
  const newCustomersToday = metrics?.business?.newToday ?? 0
  const activeSubscriptions = metrics?.business?.activeSubscriptions ?? 0
  const activeSessions = metrics?.mikrotik?.hotspot?.activeSessions ?? 0

  const loading = metrics === null

  return (
      <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">

        {/* ==================== TOTAL REVENUE ==================== */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Revenue (This Month)</CardDescription>
            {loading ? (
                <Skeleton className="h-8 w-32 mt-1" />
            ) : (
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  KES {revenue.toLocaleString()}
                </CardTitle>
            )}
            <CardAction>
              <Badge variant="outline">
                <TrendingUpIcon className="size-3.5" />
                {metrics?.revenue?.paymentsToday ?? 0} today
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {metrics?.revenue?.pendingPayments ?? 0} pending payments
              <TrendingUpIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              {metrics?.revenue?.failedPayments ?? 0} failed this month
            </div>
          </CardFooter>
        </Card>

        {/* ==================== NEW CUSTOMERS ==================== */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>New Customers</CardDescription>
            {loading ? (
                <Skeleton className="h-8 w-24 mt-1" />
            ) : (
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {newCustomersToday}
                </CardTitle>
            )}
            <CardAction>
              <Badge variant="outline">
                <TrendingUpIcon className="size-3.5" />
                Today
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {metrics?.business?.totalUsers ?? 0} total customers
              <TrendingUpIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              All-time registered users
            </div>
          </CardFooter>
        </Card>

        {/* ==================== ACTIVE SUBSCRIPTIONS ==================== */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Active Subscriptions</CardDescription>
            {loading ? (
                <Skeleton className="h-8 w-24 mt-1" />
            ) : (
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {activeSubscriptions.toLocaleString()}
                </CardTitle>
            )}
            <CardAction>
              <Badge variant={metrics?.business?.expiringSoon > 0 ? "destructive" : "outline"}>
                {metrics?.business?.expiringSoon > 0 ? (
                    <TrendingDownIcon className="size-3.5" />
                ) : (
                    <TrendingUpIcon className="size-3.5" />
                )}
                {metrics?.business?.expiringSoon ?? 0} expiring
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {metrics?.business?.expiringSoon > 0
                  ? "Renewals needed soon"
                  : "All subscriptions healthy"}
              {metrics?.business?.expiringSoon > 0 ? (
                  <TrendingDownIcon className="size-4" />
              ) : (
                  <TrendingUpIcon className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">Expiring in next 7 days</div>
          </CardFooter>
        </Card>

        {/* ==================== ACTIVE SESSIONS ==================== */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Active Sessions</CardDescription>
            {loading ? (
                <Skeleton className="h-8 w-16 mt-1" />
            ) : (
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {activeSessions}
                </CardTitle>
            )}
            <CardAction>
              <Badge variant={metrics?.mikrotik?.online ? "outline" : "destructive"}>
                {metrics?.mikrotik?.online ? (
                    <TrendingUpIcon className="size-3.5" />
                ) : (
                    <TrendingDownIcon className="size-3.5" />
                )}
                {metrics?.mikrotik?.online ? "Router Online" : "Router Offline"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              CPU Load: {metrics?.mikrotik?.cpu?.load ?? 0}%
              <TrendingUpIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Live from MikroTik router
            </div>
          </CardFooter>
        </Card>

      </div>
  )
}