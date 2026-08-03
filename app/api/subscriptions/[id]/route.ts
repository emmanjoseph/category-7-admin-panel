import { proxyGet } from "@/lib/proxy";

export const GET = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    return proxyGet(`api/subscriptions/${id}`);
};