import { proxyGet } from "@/lib/proxy";

export const GET = async () => proxyGet('api/notifications/unread-count');