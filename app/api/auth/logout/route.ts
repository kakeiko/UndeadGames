'use server'

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getRequestOrigin } from "@/app/utils/request-origin";

export async function GET(req: NextRequest) {
    const cookieStore = await cookies();
    cookieStore.delete("steamid");
    
    return NextResponse.redirect(new URL("/", getRequestOrigin(req)));
}
