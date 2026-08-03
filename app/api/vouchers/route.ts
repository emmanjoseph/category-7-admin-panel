import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getAuthHeader() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    return token ? `Bearer ${token}` : "";
}

// POST /api/vouchers → creates single OR batch (body decides)
export async function POST(req: NextRequest) {
    const body = await req.json();
    const endpoint = body.quantity && body.quantity > 1 ? "batch" : "single";

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vouchers/${endpoint}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: await getAuthHeader(),
            },
            body: JSON.stringify(body),
        }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}