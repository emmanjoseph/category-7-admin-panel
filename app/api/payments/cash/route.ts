import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/cash`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify(body),
        }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}