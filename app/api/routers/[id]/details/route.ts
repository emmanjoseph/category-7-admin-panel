import { proxyGet } from "@/lib/proxy"

export const GET = async (
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params
    return proxyGet(`/api/routers/${id}/details`)
}