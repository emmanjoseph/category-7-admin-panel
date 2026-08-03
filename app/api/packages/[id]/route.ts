import {proxyPut, proxyDelete, proxyPost} from "@/lib/proxy";

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    const body = await req.json();
    return proxyPut(`/api/packages/${id}`, body);
};

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    return proxyDelete(`/api/packages/${id}`);
};

