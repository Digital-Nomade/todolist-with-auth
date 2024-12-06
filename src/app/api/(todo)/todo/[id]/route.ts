import { fetcher } from '@/config/axios';
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  const id = params.id
  const authorization = request.headers.get('authorization')

  if (!id) {
    return new NextResponse('No ID', { status: 400, statusText: 'Flipengou' })
  }

  if (!authorization) {
    return new NextResponse('No Authorization Asblablafa', { status: 401, statusText: 'Tanga Mandápio' })
  }

  try {
    const response = await fetcher.get(`/todo/${id}`, {
      headers: { 'Authorization' : authorization }
    })

    return new NextResponse(JSON.stringify(response.data), { status: 200, statusText: 'Deu certo!!!'})
  } catch(error: any) {
    return new NextResponse(JSON.stringify(error), { status: error?.status, statusText: 'Deu MERDA!!!'})
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const id = params.id
  const authorization = request.headers.get('authorization')
  const body = await request.json()

  if (!id) {
    return new NextResponse('No ID', { status: 400, statusText: 'Flipengou' })
  }

  if (!authorization) {
    return new NextResponse('No Authorization Asblablafa', { status: 401, statusText: 'Tanga Mandápio' })
  }

  try {
    const response = await fetcher.patch(`/todo/${id}`, 
    { ...body },
    { headers: { 'Authorization' : authorization } }
    )

    return new NextResponse(JSON.stringify(response.data), { status: 200, statusText: 'Deu certo!!!'})
  } catch(error: any) {
    console.log(error)
    return new NextResponse(JSON.stringify(error), { status: error?.status, statusText: 'Deu MERDA!!!'})
  }
}