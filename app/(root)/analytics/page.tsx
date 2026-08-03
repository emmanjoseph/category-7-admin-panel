"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import { ChartTooltip, ChartTooltipContent, ChartContainer, ChartConfig } from "@/components/ui/chart";
import { CalendarSync, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#EC4899",
];

// Entity types considered "system/noise" — excluded from the business-facing pie
// Adjust this list to match your actual entityType values in audit_logs
const SYSTEM_ENTITY_TYPES = new Set(["router", "system", "session"]);

const chartConfig = {
    count: {
        label: "Events",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

export default function Page() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch("/api/analytics", { cache: "no-store" });
                const data = await res.json();
                setAnalytics(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return <div className="p-6">Loading analytics...</div>;
    }

    if (!analytics?.success) {
        return <div className="p-6">Failed to load analytics</div>;
    }

    const allEntityData = analytics.data.byEntityType.map((item: any) => ({
        name: item.entityType,
        value: Number(item.count),
    }));

    // Split into business vs system entities
    const businessEntityData = allEntityData.filter(
        (item: any) => !SYSTEM_ENTITY_TYPES.has(item.name)
    );
    const systemEntityData = allEntityData.filter((item: any) =>
        SYSTEM_ENTITY_TYPES.has(item.name)
    );

    const actionData = analytics.data.byAction
        .map((item: any) => ({
            action: item.action.replace(/_/g, " "),
            count: Number(item.count),
        }))
        .sort((a: any, b: any) => b.count - a.count);

    const totalEvents = actionData.reduce((sum: number, item: any) => sum + item.count, 0);
    const totalEntities = allEntityData.reduce((sum: number, item: any) => sum + item.value, 0);

    // Surface router-offline events specifically as a health signal
    const routerOfflineEvents = actionData.find((a: any) =>
        a.action.includes("router offline")
    );
    const routerOfflineCount = routerOfflineEvents?.count ?? 0;
    const isRouterFlapping = routerOfflineCount > 10; // arbitrary threshold, tune to taste

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-3 py-4 md:py-6 px-4 lg:px-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold">Analytics</h1>
                    {isRouterFlapping && (
                        <Badge variant="destructive" className="gap-1.5">
                            <AlertTriangle className="size-3.5" />
                            Router disconnected {routerOfflineCount} times — check connection stability
                        </Badge>
                    )}
                </div>

                {/* ==================== KPI CARDS ==================== */}
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <Card className="bg-card/50">
                        <CardHeader>
                            <h1 className="text-3xl font-bold flex items-center space-x-2">
                                <CalendarSync className="size-6" />
                                <span>{totalEvents}</span>
                            </h1>
                            <CardDescription>Total Audit Events</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="bg-card/50">
                        <CardHeader>
                            <h1 className="text-3xl font-bold">{allEntityData.length}</h1>
                            <CardDescription>Entity Types</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="bg-card/50">
                        <CardHeader>
                            <h1 className="text-3xl font-bold">{totalEntities}</h1>
                            <CardDescription>Tracked Entities</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="bg-card/50">
                        <CardHeader>
                            <h1 className="text-3xl font-bold">{actionData.length}</h1>
                            <CardDescription>Action Types</CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* ==================== CHARTS ==================== */}
                <div className="grid gap-3 lg:grid-cols-6">
                    {/* Horizontal bar chart — readable at any category count */}
                    <Card className="lg:col-span-4 bg-card/50">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Activity by Action</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[420px]">
                            <ChartContainer config={chartConfig} className="aspect-auto h-[420px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={actionData}
                                        layout="vertical"
                                        margin={{ left: 8, right: 24, top: 8, bottom: 8 }}
                                    >
                                        <CartesianGrid horizontal={false} />
                                        <XAxis type="number" tickLine={false} axisLine={false} />
                                        <YAxis
                                            dataKey="action"
                                            type="category"
                                            width={170}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12 }}
                                            className="capitalize"
                                        />
                                        <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.3 }} content={<ChartTooltipContent />} />
                                        <Bar dataKey="count" fill="var(--color-count)" radius={[0, 6, 6, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Business entities only — vouchers, subscriptions, payments, packages */}
                    <Card className="lg:col-span-2 bg-card/50">
                        <CardHeader>
                            <CardTitle className="font-semibold">Business Entity Distribution</CardTitle>
                            <CardDescription>Excludes router/system events</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={businessEntityData} dataKey="value" nameKey="name" label>
                                            {businessEntityData.map((_: any, index: number) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* ==================== BREAKDOWN TABLES ==================== */}
                <div className="grid gap-3 lg:grid-cols-2">
                    <Card className="bg-card/50">
                        <CardHeader>
                            <CardTitle className={'font-bold'}>Business Entity Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {businessEntityData.map((item: any) => (
                                    <div key={item.name} className="flex justify-between border-b pb-2">
                                        <span className="capitalize">{item.name}</span>
                                        <span className="font-semibold">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50">
                        <CardHeader>
                            <CardTitle className={'font-bold'}>Top Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {actionData.slice(0, 8).map((item: any) => (
                                    <div key={item.action} className="flex justify-between border-b pb-2">
                                        <span className="capitalize">{item.action}</span>
                                        <span className="font-semibold">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ==================== SYSTEM/NOISE ENTITIES (separate, de-emphasized) ==================== */}
                {systemEntityData.length > 0 && (
                    <Card className="bg-card/30 border-dashed">
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">
                                System Events (router/session)
                            </CardTitle>
                            <CardDescription>
                                Infrastructure-level events, tracked separately from business metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                {systemEntityData.map((item: any) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground capitalize">{item.name}</span>
                                        <Badge variant="secondary">{item.value}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}