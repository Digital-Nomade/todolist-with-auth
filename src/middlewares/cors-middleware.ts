import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin');

  const response = new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': origin || '*', // Dynamically set origin
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    response.status = 204; // No Content
    return response;
  }

  return NextResponse.next(); // Continue to the API route
}
