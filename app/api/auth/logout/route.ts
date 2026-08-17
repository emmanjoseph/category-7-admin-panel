import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    const cookieStore = await cookies();
    
    // Clear the token cookie
    cookieStore.delete("token");

    return NextResponse.json({
        success: true,
        message: "Logged out successfully",
    });
}
