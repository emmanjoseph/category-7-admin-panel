"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from 'react-hook-form'
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {EyeIcon, EyeOff, LockIcon, UserCircle2} from "lucide-react";
import {cn} from "@/lib/utils";
import Link from "next/link";
import {useRouter} from "next/navigation";

const formSchema = z.object({
    identifier: z
        .string()
        .min(5, "Please enter a valid email address , phone number or username."),

    password: z
        .string()
        .min(6, "Please enter a valid password.")

})

const page =() => {
    const router = useRouter();
    const [toggle,setToggle] = React.useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    });

    const login = async (data: z.infer<typeof formSchema>) => {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        return result;
    };

    function onSubmit(data: z.infer<typeof formSchema>) {
        toast.promise(login(data), {
            loading: 'Logging in...',
            success: (result) => {
                console.log("user", result)
                router.push('/');
                return 'Logged in successfully!'
            },
            error: (error) => {
                return error.message || 'Login failed'
            },
            position: 'top-right',
        });
    }

    return (
        <section className="flex min-h-screen w-full">
            <div className="hidden lg:block lg:w-1/2 border-r border-r-muted">
                <div className="relative flex flex-col h-full w-full items-center justify-center bg-white dark:bg-black">
                    <div
                        className={cn(
                            "absolute inset-0",
                            "[background-size:20px_20px]",
                            "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
                            "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
                        )}
                    />
                    {/* Radial gradient for the container to give a faded look */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
                    <p className="text-center relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-6xl">
                        Category 7+ <br/>Internet Admin
                    </p>

                    <p className="text-center text-muted-foreground text-lg font-medium relative z-20 max-w-lg">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloremque eaque iusto libero magnam, placeat unde?
                    </p>
                </div>


            </div>

            <div className="flex flex-col w-full lg:w-1/2 items-center justify-center p-8 space-y-6">
                <div className="w-full max-w-md">
                    <div className=" space-y-4 text-center">
                        <h1 className="text-3xl font-extrabold">
                            Sign in
                        </h1>
                        <p className="text-base font-medium max-w-sm mx-auto">
                            Hey, enter your credentials to sign in to your account.
                        </p>
                    </div>
                </div>


                <div className="w-full sm:max-w-md">
                    <div>
                        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
                            <FieldGroup>
                                <Controller
                                    name="identifier"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="form-rhf-demo-title">
                                                Identifier
                                            </FieldLabel>

                                            <div className={'flex items-center bg-input/30 rounded-4xl border border-input px-4 py-2'}>
                                                <UserCircle2 className="mr-2 h-5 w-5" />
                                                <Input
                                                    aria-label="Email"
                                                    {...field}
                                                    id="form-rhf-demo-title"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="john101"
                                                    autoComplete="off"
                                                    className={'bg-transparent border-none outline-none focus-visible:ring-0 '}
                                                />
                                            </div>
                                            <FieldDescription>
                                                You can use your email, phone number or username.
                                            </FieldDescription>

                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="password"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="form-rhf-demo-description">
                                               Password
                                            </FieldLabel>
                                            <div className={'flex items-center bg-input/30 rounded-4xl border border-input px-4 py-2'}>
                                                <LockIcon className="mr-2 h-5 w-5" />
                                                <Input
                                                    aria-label="Password"
                                                    type={
                                                     toggle ? "text" : "password"
                                                    }
                                                    {...field}
                                                    id="form-rhf-demo-password"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="******"
                                                    autoComplete="off"
                                                    className={'bg-transparent border-none outline-none focus-visible:ring-0 '}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-lg"
                                                    className="ml-2 cursor-pointer"
                                                    onClick={() => setToggle((prev) => !prev)}
                                                >
                                                    {toggle ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <EyeIcon className="h-5 w-5" />
                                                    )}
                                                </Button>


                                            </div>
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </form>
                    </div>

                        <Field orientation="horizontal" className="mt-5">
                            <Button type="submit" form="form-rhf-demo" className="font-bold h-12 w-full">
                                Sign in
                            </Button>
                        </Field>

                    <div className="mt-6">
                        <p className={'text-center text-[15px]'}>Don't have an account now ?  <Link className={'font-bold'} href={'#'}>Request now</Link></p>


                    </div>

                </div>
            </div>
        </section>

    )
}

export default page
