import { proxyGet } from "@/lib/proxy";

export const GET = async () => proxyGet('api/subscriptions/expiring');