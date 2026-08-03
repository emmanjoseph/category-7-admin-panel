import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function proxyPost(path: string, body: Record<string, any> = {}) {
    const token = (await cookies()).get("token")?.value
    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(path, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
}
export async function proxyGet(path: string) {
    const token = (await cookies()).get("token")?.value
    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        cache: "no-store",
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
}

export async function proxyPatch(path: string, body?: unknown) {
    const token = (await cookies()).get("token")?.value
    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
}

export async function proxyDelete(path: string) {
    const token = (await cookies()).get("token")?.value
    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    })

    // DELETE often returns no body / 204
    if (response.status === 204) {
        return new NextResponse(null, { status: 204 })
    }

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
}

export async function proxyPut(path: string, body: unknown) {
    const token = (await cookies()).get("token")?.value
    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
}