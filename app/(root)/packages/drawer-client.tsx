"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Trash2Icon } from "lucide-react"
import {useState} from "react";
import {User} from "@/app/(root)/users/user-column";

type PackageItem = {
    id: number
    name: string
    description: string
    price: number
    speed: string
    downloadSpeed: number
    uploadSpeed: number
    dataLimit: boolean
    duration: number
    isActive: boolean
    mikrotikQueueName: string
    createdAt: string
    updatedAt: string
}

const editSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().positive("Price must be positive"),
    speed: z.string().min(1, "Speed is required"),
    downloadSpeed: z.coerce.number().positive("Required"),
    uploadSpeed: z.coerce.number().positive("Required"),
    duration: z.coerce.number().positive("Required"),
    mikrotikQueueName: z.string().min(1, "Queue name is required"),
})

type EditFormValues = z.infer<typeof editSchema>

function authHeaders() {
    const token = localStorage.getItem("token")
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    }
}

export function DrawerClient({ item }: { item: PackageItem }) {
    const isMobile = useIsMobile()
    const router = useRouter()
    const swipeDirection = isMobile ? "down" : "right"
    const [open, setOpen] = React.useState(false)
    const [deleting, setDeleting] = React.useState(false)
    const [confirmDelete, setConfirmDelete] = useState<User | null>(null)


    const form = useForm<EditFormValues>({
        resolver: zodResolver(editSchema),
        defaultValues: {
            name: item.name,
            description: item.description,
            price: item.price,
            speed: item.speed,
            downloadSpeed: item.downloadSpeed,
            uploadSpeed: item.uploadSpeed,
            duration: item.duration,
            mikrotikQueueName: item.mikrotikQueueName,
        },
    })

    // Update package (PUT)
    const updatePackage = async (data: EditFormValues) => {
        const res = await fetch(`/api/packages/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await res.json()
        if (!res.ok) throw new Error(result.message || "Failed to update package")
        return result
    }

    const onSubmit = (data: EditFormValues) => {
        toast.promise(updatePackage(data), {
            loading: "Saving changes...",
            success: () => {
                router.refresh()
                return "Package updated"
            },
            error: (err) => err.message || "Failed to update package",
            position: "top-right",
        })
    }

    // Activate / Deactivate (PATCH)
    const toggleActive = async () => {
        const endpoint = item.isActive ? "deactivate" : "activate"
        const res = await fetch(`/api/packages/${item.id}/${endpoint}`, { method: "PATCH" });
        const result = await res.json()
        if (!res.ok) throw new Error(result.message || `Failed to ${endpoint} package`)
        return result
    }

    const onToggleActive = () => {
        toast.promise(toggleActive(), {
            loading: item.isActive ? "Deactivating..." : "Activating...",
            success: () => {
                router.refresh()
                return item.isActive ? "Package deactivated" : "Package activated"
            },
            error: (err) => err.message || "Action failed",
            position: "top-right",
        })
    }

    // Delete
    const deletePackage = async () => {
        const res = await fetch(`/api/packages/${item.id}`, { method: "DELETE" })
        if (!res.ok) {
            const result = await res.json().catch(() => ({}))
            throw new Error(result.message || "Failed to delete package")
        }
    }

    const onDelete = () => {
        if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return
        setDeleting(true)
        toast.promise(deletePackage(), {
            loading: "Deleting package...",
            success: () => {
                setOpen(false)
                router.refresh()
                return "Package deleted"
            },
            error: (err) => {
                setDeleting(false)
                return err.message || "Failed to delete package"
            },
            position: "top-right",
        })
    }

    return (
        <Drawer
            open={open}
            onOpenChange={setOpen}
            showSwipeHandle={isMobile}
            swipeDirection={swipeDirection}
        >
            <DrawerTrigger
                render={
                    <Button variant="outline" className="text-sm font-medium" />
                }
            >
                View Details
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <div className="flex items-center justify-between">
                        <DrawerTitle className={'text-2xl font-bold capitalize'}>{item.name} package</DrawerTitle>
                        <Badge variant={item.isActive ? "default" : "secondary"}>
                            {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <DrawerDescription>
                        Edit package details or manage its status.
                    </DrawerDescription>
                </DrawerHeader>

                <form
                    id="package-edit-form"
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
                >
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" {...form.register("name")} />
                        {form.formState.errors.name && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input aria-label={'input-description'} id="description" {...form.register("description")} />
                        {form.formState.errors.description && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.description.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="price">Price (KES)</Label>
                            <Input aria-label={'input-label'} id="price" type="number" {...form.register("price")} />
                            {form.formState.errors.price && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.price.message}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="speed">Speed label</Label>
                            <Input aria-label={'speed'} id="speed" placeholder="10 Mbps" {...form.register("speed")} />
                            {form.formState.errors.speed && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.speed.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="downloadSpeed">Download (Kbps)</Label>
                            <Input
                                aria-label={'input-downloadSpeed'}
                                id="downloadSpeed"
                                type="number"
                                {...form.register("downloadSpeed")}
                            />
                            {form.formState.errors.downloadSpeed && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.downloadSpeed.message}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="uploadSpeed">Upload (Kbps)</Label>
                            <Input
                                aria-label={'input-uploadSpeed'}
                                id="uploadSpeed"
                                type="number"
                                {...form.register("uploadSpeed")}
                            />
                            {form.formState.errors.uploadSpeed && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.uploadSpeed.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="duration">Duration (days)</Label>
                            <Input aria-label={'input-duration'} id="duration" type="number" {...form.register("duration")} />
                            {form.formState.errors.duration && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.duration.message}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="mikrotikQueueName">Mikrotik queue name</Label>
                            <Input
                                aria-label={'mikrotikQueueName'}
                                id="mikrotikQueueName"
                                {...form.register("mikrotikQueueName")}
                            />
                            {form.formState.errors.mikrotikQueueName && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.mikrotikQueueName.message}
                                </p>
                            )}
                        </div>
                    </div>
                </form>

                <DrawerFooter className="gap-2">
                    <Button type="submit" form="package-edit-form">
                        Save changes
                    </Button>

                    <div className="grid md:grid-cols-2 gap-5">

                    </div>
                    <Button variant="outline" onClick={onToggleActive}>
                        {item.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    {/*<Button*/}
                    {/*    variant="destructive"*/}

                    {/*>*/}
                    {/*    */}
                    {/*    {deleting ? "Deleting..." : "Delete package"}*/}
                    {/*</Button>*/}

                    <AlertDialog>
                        <AlertDialogTrigger
                            render={<Button variant="destructive"><Trash2Icon className="mr-1 size-4" />Delete package</Button>}
                        />
                        <AlertDialogContent size={'sm'}>
                            <AlertDialogHeader>
                                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                                    <Trash2Icon />
                                </AlertDialogMedia>
                                <AlertDialogTitle>Delete {item.name} package</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will permanently delete the selected internet package and erase all related data.Are you sure you want to delete this internet package?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                        onClick={onDelete}
                                        disabled={deleting}
                                >
                                    {deleting ? "Deleting..." : "Delete "}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <DrawerClose render={<Button variant="outline">Close</Button>} />
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}