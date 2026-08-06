import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getAuthHeader() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    return token ? `Bearer ${token}` : "";
}
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`,
        {
            headers: {
                Authorization: await getAuthHeader(),
                "Content-Type": "application/json",
            },
        }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}


export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`,
        {
            method: "PATCH",
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

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`,
        {
            method: "DELETE",
            headers: {
                Authorization: await getAuthHeader(),
            },
        }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}