import React from 'react'
import {getInternetPackages} from "@/lib/api";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {DrawerClient} from "@/app/(root)/packages/drawer-client";
import {PlusSquareIcon} from "lucide-react";
import {AddPackageDrawer} from "@/app/(root)/packages/AddPackageDrawer";


const Packages = async () => {
    const packages = await getInternetPackages();
    type PackageItem = {
        id: number;
        name: string;
        description: string;
        price: number;
        speed: string;
        downloadSpeed: number;
        uploadSpeed: number;
        dataLimit: boolean;
        duration: number;
        isActive: boolean;
        mikrotikQueueName: string;
        createdAt: string;
        updatedAt: string;
    }


    return (
        <div className={'@container/main flex flex-1 flex-col gap-2'}>
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <h1 className="text-base font-bold">
                    Internet packages
                </h1>

                <div className="">
                    <AddPackageDrawer/>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {packages.data.packages.map((packageItem: PackageItem) => (
                        <Card key={packageItem.id} className="rounded-3xl bg-card/90 drop-shadow-2xl">
                            <CardHeader className="flex justify-between space-y-0 pb-2 flex-col">
                                <Badge variant="outline" className="rounded-full">
                                    {
                                        packageItem.isActive ? (
                                            <div className={'flex items-center space-x-2'}>
                                                <span className={'size-3 rounded-full border border-green-500 flex items-center justify-center'} >
                                                    <span className={'size-1 rounded-full bg-green-500 animate-pulse'} />
                                                </span>
                                                <span>Active</span>
                                            </div>
                                        ):(
                                            <div className={'flex items-center space-x-2'}>
                                                <span className={'size-3 rounded-full border border-red-500 flex items-center justify-center'} >
                                                    <span className={'size-1 rounded-full bg-red-500 animate-pulse'} />
                                                </span>
                                                <span>Inactive</span>
                                            </div>
                                        )
                                    }

                                </Badge>
                                <CardTitle className="text-lg font-semibold capitalize">{packageItem.name}</CardTitle>
                                <CardDescription className="text-sm font-medium">{packageItem.description}</CardDescription>
                                <h1 className="text-3xl font-extrabold">kes {packageItem.price}</h1>
                            </CardHeader>

                            <CardContent className={'flex flex-col space-y-4'}>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Speed</span>
                                    <span className="text-sm font-medium">{packageItem.speed}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Upload Speed</span>
                                    <span className="text-sm font-medium">{packageItem.uploadSpeed}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Download Speed</span>
                                    <span className="text-sm font-medium">{packageItem.downloadSpeed}</span>
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-between items-center">
                                <DrawerClient item={packageItem} />
                            </CardFooter>

                        </Card>
                    ))}
                </div>
            </div>




            </div>
    )
}
export default Packages
