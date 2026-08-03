"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRouter as useNextRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsMobile } from "@/hooks/use-mobile"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Loader2, RefreshCw } from "lucide-react"
import type { Router } from "./router-data-column"
import {Drawer, DrawerContent, DrawerHeader, DrawerTrigger,DrawerDescription,DrawerFooter} from "@/components/ui/drawer";


const updateSchema = z.object({
    name: z.string().min(2, "Router name is required"),
    location: z.string().optional(),
    ipAddress: z.string().optional(),
    username: z.string().min(1, "Username is required"),
    password: z.string().optional(), // optional on update — blank means "don't change"
    port: z.coerce.number().min(1),
    restPort: z.coerce.number().min(1),
    isPrimary: z.boolean(),
})

type UpdateForm = z.infer<typeof updateSchema>

interface RouterDetails {
    router: Router
    subscription: {
        id: number
        status: string
        endDate: string
    } | null
    parentRouter: Router | null
}

interface RouterMetrics {
    online: boolean
    routerName?: string
    version?: string
    uptime?: string
    cpu?: { load: number; count: number }
    memory?: { percentUsed: string; used: number; total: number }
    storage?: { percentUsed: string }
    hotspot?: { activeSessions: number; totalUsers: number }
    error?: string
}

const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case "online": return "default"
        case "maintenance": return "secondary"
        case "offline": case "error": return "destructive"
        default: return "outline"
    }
}

const bytesToGB = (bytes: number) => (bytes / 1024 / 1024 / 1024).toFixed(2)

export function RouterDetailsDrawer({
                                        routerId,
                                        open,
                                        onOpenChange,
                                    }: {
    routerId: number | null
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const nextRouter = useNextRouter()
    const [details, setDetails] = useState<RouterDetails | null>(null)
    const [metrics, setMetrics] = useState<RouterMetrics | null>(null)
    const [loadingDetails, setLoadingDetails] = useState(true)
    const [loadingMetrics, setLoadingMetrics] = useState(true)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UpdateForm>({
        resolver: zodResolver(updateSchema),
    })

    const fetchDetails = async () => {
        if (!routerId) return
        setLoadingDetails(true)
        try {
            const res = await fetch(`/api/routers/${routerId}/details`)
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.message)
            setDetails(data.data)
            reset({
                name: data.data.router.name,
                location: data.data.router.location ?? "",
                ipAddress: data.data.router.ipAddress ?? "",
                username: data.data.router.username ?? "",
                password: "",
                port: data.data.router.port,
                restPort: data.data.router.restPort,
                isPrimary: data.data.router.isPrimary,
            })
        } catch (err: any) {
            toast.error(err.message || "Failed to load router details")
        } finally {
            setLoadingDetails(false)
        }
    }

    const fetchMetrics = async () => {
        if (!routerId) return
        setLoadingMetrics(true)
        try {
            const res = await fetch(`/api/routers/${routerId}/metrics`)
            const data = await res.json()
            setMetrics(data.data)
        } catch {
            setMetrics(null)
        } finally {
            setLoadingMetrics(false)
        }
    }

    useEffect(() => {
        if (open && routerId) {
            fetchDetails()
            fetchMetrics()
        } else {
            setDetails(null)
            setMetrics(null)
        }
    }, [open, routerId])

    const onSubmit = async (values: UpdateForm) => {
        if (!routerId) return

        // Don't send an empty password — backend would overwrite with blank
        const payload: Partial<UpdateForm> = { ...values }
        if (!payload.password) delete payload.password

        try {
            const res = await fetch(`/api/routers/${routerId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.message)

            toast.success("Router updated")
            nextRouter.refresh()
            fetchDetails()
        } catch (err: any) {
            toast.error(err.message || "Failed to update router")
        }
    }

    const router = details?.router
    const isMobile = useIsMobile()

    return (
        <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle={isMobile}
                swipeDirection={isMobile ? "down" : "right"}>
            <DrawerTrigger className={'hidden'} render={<Button variant="outline" />}>Open</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <div className="flex items-center justify-between">
                        <DrawerHeader>{router?.name ?? "Router details"}</DrawerHeader>
                        {router && (
                            <Badge variant={statusVariant(router.status)} className="capitalize">
                                {router.status}
                            </Badge>
                        )}
                    </div>
                    <DrawerDescription>
                        {router?.location ?? "Loading router information..."}
                    </DrawerDescription>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                    <Tabs defaultValue="overview" className="mt-4">
                        <TabsList className="w-full">
                            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                            <TabsTrigger value="metrics" className="flex-1">Live Metrics</TabsTrigger>
                            <TabsTrigger value="edit" className="flex-1">Edit</TabsTrigger>
                        </TabsList>

                        {/* ==================== OVERVIEW TAB ==================== */}
                        <TabsContent value="overview" className="space-y-4 mt-4">
                            {loadingDetails ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ) : router ? (
                                <>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Type</p>
                                            <p className="font-medium capitalize">{router.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Primary</p>
                                            <p className="font-medium">{router.isPrimary ? "Yes" : "No"}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">IP Address</p>
                                            <p className="font-mono font-medium">{router.ipAddress || "Not assigned"}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Ports</p>
                                            <p className="font-mono font-medium">{router.port} / {router.restPort}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Consecutive Failures</p>
                                            <p className={`font-medium ${router.consecutiveFailures > 0 ? "text-destructive" : ""}`}>
                                                {router.consecutiveFailures}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Last Seen</p>
                                            <p className="font-medium">
                                                {router.lastSeen ? new Date(router.lastSeen).toLocaleString() : "Never"}
                                            </p>
                                        </div>
                                    </div>

                                    {details?.parentRouter && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="text-sm font-medium mb-2">Parent Router</p>
                                                <div className="flex items-center justify-between text-sm border rounded-lg p-3">
                                                    <div>
                                                        <p className="font-medium">{details.parentRouter.name}</p>
                                                        <p className="text-muted-foreground font-mono text-xs">
                                                            {details.parentRouter.ipAddress}
                                                        </p>
                                                    </div>
                                                    <Badge variant={statusVariant(details.parentRouter.status)} className="capitalize">
                                                        {details.parentRouter.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {details?.subscription && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="text-sm font-medium mb-2">Linked Subscription</p>
                                                <div className="flex items-center justify-between text-sm border rounded-lg p-3">
                                                    <div>
                                                        <p className="font-medium">Subscription #{details.subscription.id}</p>
                                                        <p className="text-muted-foreground text-xs">
                                                            Expires {new Date(details.subscription.endDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="capitalize">
                                                        {details.subscription.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">No details available</p>
                            )}
                        </TabsContent>

                        {/* ==================== LIVE METRICS TAB ==================== */}
                        <TabsContent value="metrics" className="space-y-4 mt-4">
                            <div className="flex justify-end">
                                <Button variant="ghost" size="sm" onClick={fetchMetrics} disabled={loadingMetrics}>
                                    <RefreshCw className={`size-3.5 mr-1.5 ${loadingMetrics ? "animate-spin" : ""}`} />
                                    Refresh
                                </Button>
                            </div>

                            {loadingMetrics ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            ) : !metrics?.online ? (
                                <div className="text-sm text-muted-foreground border rounded-lg p-4 text-center">
                                    Router is offline or unreachable
                                    {metrics?.error && (
                                        <p className="text-xs text-destructive mt-1">{metrics.error}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">RouterOS Version</p>
                                        <p className="font-medium">{metrics.version}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Uptime</p>
                                        <p className="font-medium">{metrics.uptime}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">CPU Load</p>
                                        <p className="font-medium">
                                            {metrics.cpu?.load}% ({metrics.cpu?.count} cores)
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Memory Used</p>
                                        <p className="font-medium">{metrics.memory?.percentUsed}%</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Storage Used</p>
                                        <p className="font-medium">{metrics.storage?.percentUsed}%</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Active Sessions</p>
                                        <p className="font-medium">{metrics.hotspot?.activeSessions}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground">Total Hotspot Users</p>
                                        <p className="font-medium">{metrics.hotspot?.totalUsers}</p>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* ==================== EDIT TAB ==================== */}
                        <TabsContent value="edit" className="mt-4">
                            {loadingDetails ? (
                                <Skeleton className="h-64 w-full" />
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <FieldGroup>
                                        <Field>
                                            <Label>Name</Label>
                                            <Input {...register("name")} />
                                            <p className="text-sm text-destructive">{errors.name?.message}</p>
                                        </Field>

                                        <Field>
                                            <Label>Location</Label>
                                            <Input {...register("location")} />
                                        </Field>

                                        <Field>
                                            <Label>IP Address</Label>
                                            <Input {...register("ipAddress")} />
                                        </Field>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field>
                                                <Label>Username</Label>
                                                <Input {...register("username")} />
                                                <p className="text-sm text-destructive">{errors.username?.message}</p>
                                            </Field>
                                            <Field>
                                                <Label>Password</Label>
                                                <Input
                                                    aria-label={'password'}
                                                    type="password"
                                                    placeholder="Leave blank to keep current"
                                                    {...register("password")}
                                                />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field>
                                                <Label>API Port</Label>
                                                <Input type="number" {...register("port")} />
                                            </Field>
                                            <Field>
                                                <Label>REST Port</Label>
                                                <Input type="number" {...register("restPort")} />
                                            </Field>
                                        </div>
                                    </FieldGroup>

                                    <DrawerFooter className="px-0 mt-6">
                                        <Button type="submit" disabled={isSubmitting} className="w-full">
                                            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                                            Save Changes
                                        </Button>
                                    </DrawerFooter>
                                </form>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </DrawerContent>
        </Drawer>
    )
}