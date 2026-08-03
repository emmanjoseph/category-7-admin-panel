import { proxyGet, proxyPost } from "@/lib/proxy";

export const GET = async () => proxyGet('api/subscriptions');

export const POST = async (req: Request) => {
    const body = await req.json();
    return proxyPost('api/subscriptions/create', body);
};