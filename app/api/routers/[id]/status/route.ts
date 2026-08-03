import { proxyPatch } from "@/lib/proxy"

export const PATCH = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params
    const body = await req.json()
    return proxyPatch(`/api/routers/${id}/status`, body)
}