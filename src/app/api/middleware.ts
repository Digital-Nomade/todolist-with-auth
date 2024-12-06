import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.headers.get('authorization')

  if (!token) {
    return new NextResponse('Not Authorized', { status: 401 })
  }

  return NextResponse.next()
}