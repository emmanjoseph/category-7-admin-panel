import { cookies } from "next/headers";


export async function getAudits() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/audit/logs`,
        {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
            cache: "no-store",
        }
    );

    return response.json();
}


export async function getUsers() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
            cache: "no-store",
        }
    );

    return response.json();

}

export async function getInternetPackages() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/packages`,
        {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
            cache: "no-store",
        }
    );

    return response.json();
}


export async function getVouchers(status?: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/vouchers`);
    if (status) url.searchParams.set("status", status);

    const response = await fetch(url.toString(), {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        cache: "no-store",
    });

    return response.json();
}

export async function getVoucherStats() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vouchers/stats`,
        {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
            cache: "no-store",
        }
    );

    return response.json();
}

export async function getVoucherTiers() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vouchers/tiers`,
        {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
            cache: "no-store",
        }
    );

    return response.json();
}

export async function getSubscriptions(params?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions`);
    if (params?.status) url.searchParams.set("status", params.status);
    if (params?.page) url.searchParams.set("page", String(params.page));
    if (params?.limit) url.searchParams.set("limit", String(params.limit));
    if (params?.search) url.searchParams.set("search", params.search);

    const response = await fetch(url.toString(), {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        cache: "no-store",
    });

    return response.json();
}

export async function getSubscriptionStats() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/stats`,
        {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
            cache: "no-store",
        }
    );

    return response.json();
}

export async function getSubscriptionById(id: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/${id}`,
        {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
            cache: "no-store",
        }
    );

    return response.json();
}

export async function getUserById (id:string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`,
        {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
            cache: "no-store",
        }
    );

    return response.json();

}

export async function getSubscriptionPayments(subscriptionId: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/all`);
    url.searchParams.set("subscriptionId", subscriptionId);

    const response = await fetch(url.toString(), {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        cache: "no-store",
    });

    return response.json();
}

export async function getSubscriptionSessions(subscriptionId: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/history`);
    url.searchParams.set("subscriptionId", subscriptionId);
    url.searchParams.set("limit", "20");

    const response = await fetch(url.toString(), {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        cache: "no-store",
    });

    return response.json();
}

export async function getPayments(params?: {
    status?: string;
    paymentMethod?: string;
    page?: number;
    limit?: number;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/all`);
    if (params?.status) url.searchParams.set("status", params.status);
    if (params?.paymentMethod) url.searchParams.set("paymentMethod", params.paymentMethod);
    if (params?.page) url.searchParams.set("page", String(params.page));
    if (params?.limit) url.searchParams.set("limit", String(params.limit));

    const response = await fetch(url.toString(), {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        cache: "no-store",
    });

    return response.json();
}

export async function getPaymentStats() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/stats`,
        {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
            cache: "no-store",
        }
    );

    return response.json();
}