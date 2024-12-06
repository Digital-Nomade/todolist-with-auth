export const dynamic = 'force-static'

import { fetcher } from "@/config/axios"
import { NextRequest } from "next/server"


export async function POST(request: NextRequest) {
  try {
    const body = request.body

    const result = await fetcher.post(
      '/auth/user',
      { ...body },
    )

    return new Response(JSON.stringify(result.data), { status: 200 })
  } catch (error: unknown) {
    console.log(error)
    return new Response('Error', { status: 501 })

  }
}