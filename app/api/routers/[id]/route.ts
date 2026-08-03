import {proxyGet, proxyPut} from "@/lib/proxy"

export const GET = async (
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params
    return proxyGet(`/api/routers/${id}`)
}

export const PUT = async (
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
)=> {
    const { id } = await params;
    const body = await _req.json();
    return proxyPut(`/api/routers/${id}`, body);
}