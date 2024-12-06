import { fetcher } from '@/config/axios'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')
    const response = await fetcher.get('/todo', {
      headers: {
        'Authorization': `${authorization}`,
      }
    })
    return new NextResponse(JSON.stringify(response.data), { status: 200 })
  } catch(error: any) {
    return new NextResponse(JSON.stringify(error), { status: error?.status })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const authorization = request.headers.get('authorization')

  try {
    const response = await fetcher.post(
      '/todo',
      { ...body },
      { headers: { 'Authorization': authorization } }
    )
    return new NextResponse(JSON.stringify(response.data), { status: 200, statusText: 'DEU BOM!' })
  } catch(error: any) {
    console.log(error)
    return new NextResponse(JSON.stringify(error), { status: error?.status, statusText: 'Merda alada'})
  }
}