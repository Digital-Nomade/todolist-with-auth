export const dynamic = 'force-static'

export async function POST(request: Request) {
  try {

    const data = await request.json()

    const result = await fetch('localhost:8000/auth/user', { body: data })
    const newData =  await result.json()

    return new Response(JSON.stringify(newData), { status: 200 })
  } catch (error: unknown) {
    console.log(error)
    return new Response('Error', { status: 501 })

  }
}