"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const routerSchema = z.object({
    name: z.string().min(2, "Router name is required"),
    type: z.enum(["main", "cpe"]),
    ipAddress: z.string().optional(),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
    port: z.coerce.number().min(1, "API port is required"),
    restPort: z.coerce.number().min(1, "REST port is required"),
    isPrimary: z.boolean(),
    location: z.string().min(1, "Location is required"),
});

type RouterForm = z.infer<typeof routerSchema>;

export function AddRouterDialog() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<RouterForm>({
        resolver: zodResolver(routerSchema),
        defaultValues: {
            name: "",
            type: "main",
            ipAddress: "",
            username: "admin",
            password: "",
            port: 8728,
            restPort: 80,
            isPrimary: false,
            location: "",
        },
    });

    async function createRouter(values: RouterForm) {
        const res = await fetch(`/api/routers/add-new`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to create router");
        return result;
    }

    async function onSubmit(values: RouterForm) {
        toast.promise(createRouter(values), {
            loading: "Adding router...",
            success: () => {
                reset();
                setOpen(false);
                router.refresh();
                return "Router added";
            },
            error: (err) => err.message || "Failed to add router",
            position: "top-right",
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="secondary" size={'sm'}>Add New Router</Button>} />

            <DialogContent className="max-w-2xl">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Add a new router</DialogTitle>
                        <DialogDescription>
                            Register a new router for management.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="mt-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label>Name</Label>
                                <Input placeholder="johns router" {...register("name")} />
                                <p className="text-sm text-destructive">{errors.name?.message}</p>
                            </Field>

                            <Field>
                                <Label>Type</Label>
                                <Select
                                    value={watch("type")}
                                    onValueChange={(v) => setValue("type", v as RouterForm["type"])}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="main">Main</SelectItem>
                                        <SelectItem value="cpe">cpe</SelectItem>

                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>

                        <Field>
                            <Label>Location</Label>
                            <Input placeholder="makueni" {...register("location")} />
                            <p className="text-sm text-destructive">{errors.location?.message}</p>
                        </Field>

                        <Field>
                            <Label>IP Address</Label>
                            <Input placeholder="12.345.789" {...register("ipAddress")} />
                            <p className="text-sm text-destructive">{errors.ipAddress?.message}</p>
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label>Username</Label>
                                <Input {...register("username")} />
                                <p className="text-sm text-destructive">{errors.username?.message}</p>
                            </Field>

                            <Field>
                                <Label>Password</Label>
                                <Input type="password" {...register("password")} />
                                <p className="text-sm text-destructive">{errors.password?.message}</p>
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label>API Port</Label>
                                <Input type="number" {...register("port")} />
                                <p className="text-sm text-destructive">{errors.port?.message}</p>
                            </Field>

                            <Field>
                                <Label>REST Port</Label>
                                <Input type="number" {...register("restPort")} />
                                <p className="text-sm text-destructive">{errors.restPort?.message}</p>
                            </Field>
                        </div>

                        <Field>
                            <div className="flex items-center justify-between">
                                <Label>Primary router</Label>
                                <Switch
                                    checked={watch("isPrimary")}
                                    onCheckedChange={(v) => setValue("isPrimary", v)}
                                />
                            </div>
                        </Field>
                    </FieldGroup>

                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            Save Router
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}