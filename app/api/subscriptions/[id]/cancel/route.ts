import { proxyPatch } from "@/lib/proxy";

export const PATCH = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    return proxyPatch(`api/subscriptions/${id}/cancel`);
};