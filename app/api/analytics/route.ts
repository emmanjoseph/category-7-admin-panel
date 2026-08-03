import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function getHeader() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    return token ? `Bearer ${token}` : "";
}

export async function GET() {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/audit/statistics`,
            {
                headers: {
                    Authorization: await getHeader(),
                },
                cache: "no-store",
            }
        );

        const data = await res.json();

        return NextResponse.json(data, {
            status: res.status,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}