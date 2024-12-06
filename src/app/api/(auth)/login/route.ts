import axios from 'axios'
import { NextRequest } from 'next/server'
export const dynamic = 'force-static'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { data, status, statusText } = await axios.post<BodyInit>(
      'http://localhost:8000/auth/login',
      { ...body },
    )

    return new Response(JSON.stringify(data), { status, statusText })
  } catch (error: unknown) {

    return new Response(JSON.stringify(error), { status: 599})
  }
}
