import {proxyPost} from "@/lib/proxy";

export const POST = async (req: Request) => {
    const body = await req.json();
    return proxyPost('/api/packages', body);
};