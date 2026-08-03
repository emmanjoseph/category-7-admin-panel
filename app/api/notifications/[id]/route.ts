import { proxyDelete } from "@/lib/proxy";

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    return proxyDelete(`/api/notifications/${id}`);
};