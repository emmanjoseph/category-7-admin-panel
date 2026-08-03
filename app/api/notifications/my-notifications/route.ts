import { proxyGet, proxyDelete } from "@/lib/proxy";

export const GET = async () => proxyGet('/api/notifications/my-notifications?limit=10');

export const DELETE = async () => proxyDelete('/api/notifications/my-notifications');