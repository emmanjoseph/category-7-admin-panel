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
import { Textarea } from "@/components/ui/textarea";

const packageSchema = z.object({
    name: z.string().min(2, "Package name is required"),
    description: z.string().min(10, "Description is required"),
    price: z.coerce.number().min(1, "Price is required"),
    speed: z.string().min(1, "Speed is required"),
    downloadSpeed: z.coerce.number().min(1),
    uploadSpeed: z.coerce.number().min(1),
    duration: z.coerce.number().min(1, "Duration is required"),
    mikrotikQueueName: z.string().min(2),
});

type PackageForm = z.infer<typeof packageSchema>;

export function AddPackageDrawer() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<PackageForm>({
        resolver: zodResolver(packageSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 1500,
            speed: "2 Mbps",
            downloadSpeed: 2048,
            uploadSpeed: 2048,
            duration: 30,
            mikrotikQueueName: "",
        },
    });

    async function createPackage(values: PackageForm) {
        const res = await fetch(`/api/packages/add-new`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to create package");
        return result;
    }

    async function onSubmit(values: PackageForm) {
        toast.promise(createPackage(values), {
            loading: "Creating package...",
            success: () => {
                reset();
                setOpen(false);
                router.refresh();
                return "Package created";
            },
            error: (err) => err.message || "Failed to create package",
            position: "top-right",
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add New Package</Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Add Internet Package</DialogTitle>
                        <DialogDescription>
                            Create a new internet package for customers.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="mt-6">
                        <Field>
                            <Label>Name</Label>
                            <Input placeholder="Basic" {...register("name")} />
                            <p className="text-sm text-destructive">{errors.name?.message}</p>
                        </Field>

                        <Field>
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Entry-level internet package..."
                                {...register("description")}
                                aria-label={'Description'}
                            />
                            <p className="text-sm text-destructive">{errors.description?.message}</p>
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label>Price (KES)</Label>
                                <Input type="number" {...register("price")} />
                            </Field>
                            <Field>
                                <Label>Display Speed</Label>
                                <Input placeholder="2 Mbps" {...register("speed")} />
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label>Download Speed (Kbps)</Label>
                                <Input type="number" {...register("downloadSpeed")} />
                            </Field>
                            <Field>
                                <Label>Upload Speed (Kbps)</Label>
                                <Input type="number" {...register("uploadSpeed")} />
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label>Duration (Days)</Label>
                                <Input type="number" {...register("duration")} />
                            </Field>
                            <Field>
                                <Label>MikroTik Queue Name</Label>
                                <Input placeholder="basic-2mb" {...register("mikrotikQueueName")} />
                            </Field>
                        </div>
                    </FieldGroup>

                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            Save Package
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
