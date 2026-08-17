"use client";

import { useState, useEffect ,Suspense} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {Save} from "lucide-react";


function SettingsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const tab = searchParams.get("tab") || "general";
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = () => {
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            toast.success("Settings saved successfully");
        }, 1000);
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-xl font-bold tracking-tight">Settings</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleSave} disabled={isLoading}>
                        <Save className="mr-2 h-4 w-4" />
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            <Tabs
                value={tab}
                onValueChange={(value) => router.push(`/settings?tab=${value}`)}
                className="space-y-4"
            >
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="billing">Payments</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>System Configuration</CardTitle>
                                <CardDescription>
                                    Manage your core application settings and localization.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="site-name">Site Name</Label>
                                    <Input id="site-name" defaultValue="Category 7 Internet Admin" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="support-email">Support Email</Label>
                                    <Input id="support-email" type="email" defaultValue="support@category7.com" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="currency">Default Currency</Label>
                                        <Select defaultValue="USD">
                                            <SelectTrigger id="currency">
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                                <SelectItem value="KES">KES (Sh)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="timezone">Timezone</Label>
                                        <Select defaultValue="UTC">
                                            <SelectTrigger id="timezone">
                                                <SelectValue placeholder="Select timezone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UTC">UTC</SelectItem>
                                                <SelectItem value="EST">EST</SelectItem>
                                                <SelectItem value="GMT">GMT+3</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Preferences</CardTitle>
                                <CardDescription>
                                    Customize your dashboard experience.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between space-x-2">
                                    <Label htmlFor="maintenance-mode" className="flex flex-col space-y-1">
                                        <span>Maintenance Mode</span>
                                        <span className="font-normal text-xs text-muted-foreground">
                                            Disable public access during updates.
                                        </span>
                                    </Label>
                                    <Switch id="maintenance-mode" />
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                    <Label htmlFor="auto-refresh" className="flex flex-col space-y-1">
                                        <span>Auto-refresh Data</span>
                                        <span className="font-normal text-xs text-muted-foreground">
                                            Automatically update dashboard stats.
                                        </span>
                                    </Label>
                                    <Switch id="auto-refresh" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                    <Label htmlFor="debug-logs" className="flex flex-col space-y-1">
                                        <span>Enhanced Logging</span>
                                        <span className="font-normal text-xs text-muted-foreground">
                                            Enable detailed system logs for debugging.
                                        </span>
                                    </Label>
                                    <Switch id="debug-logs" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Profile Settings */}
                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Profile</CardTitle>
                            <CardDescription>
                                Update your personal information and how others see you.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-linear-120 from-fuchsia-500 to-green-500 flex items-center justify-center text-2xl font-bold text-white">
                                    AD
                                </div>
                                <Button variant="outline">Change Avatar</Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="full-name">Full Name</Label>
                                    <Input id="full-name" defaultValue="Admin User" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="admin-email">Email Address</Label>
                                    <Input id="admin-email" type="email" defaultValue="admin@category7.com" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications */}
                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Choose what notifications you want to receive.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                                    <span>Email Alerts</span>
                                    <span className="font-normal text-xs text-muted-foreground">
                                        Receive alerts for critical system events.
                                    </span>
                                </Label>
                                <Switch id="email-notifications" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="payment-alerts" className="flex flex-col space-y-1">
                                    <span>Payment Notifications</span>
                                    <span className="font-normal text-xs text-muted-foreground">
                                        Get notified when a new payment is received.
                                    </span>
                                </Label>
                                <Switch id="payment-alerts" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="new-user-alerts" className="flex flex-col space-y-1">
                                    <span>New User Signups</span>
                                    <span className="font-normal text-xs text-muted-foreground">
                                        Get notified when new users join.
                                    </span>
                                </Label>
                                <Switch id="new-user-alerts" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security */}
                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>
                                Manage your password and account security.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" />
                            </div>
                            <Button className="w-fit">Update Password</Button>
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Two-Factor Authentication</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Add an extra layer of security to your account.
                                        </p>
                                    </div>
                                    <Button variant="outline">Enable 2FA</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Billing/Payments */}
                <TabsContent value="billing" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Gateway Configuration</CardTitle>
                            <CardDescription>
                                Configure how your customers pay for subscriptions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="gateway">Primary Gateway</Label>
                                <Select defaultValue="mpesa">
                                    <SelectTrigger id="gateway">
                                        <SelectValue placeholder="Select gateway" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mpesa">M-PESA</SelectItem>
                                        <SelectItem value="stripe">Stripe</SelectItem>
                                        <SelectItem value="paypal">PayPal</SelectItem>
                                        <SelectItem value="cash">Manual Cash</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="api-key">Gateway API Key</Label>
                                <Input id="api-key" type="password" defaultValue="sk_test_51Mz..." />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="sandbox-mode" defaultChecked />
                                <Label htmlFor="sandbox-mode">Enable Sandbox Mode</Label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div>Loading settings...</div>}>
            <SettingsContent />
        </Suspense>
    );
}
