

export const dynamic = 'force-static'

export async function POST(request: Request, response: Response) {
  try {
    response.headers.set('Access-Control-Allow-Origin', '*'); // Allow all origins
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow specific methods
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers


    const data = await request.json()

    const result = await fetch('http://localhost:8000/auth/login', { body: data, method: 'POST' })
    const newData =  await result.json()

    return new Response(JSON.stringify(newData), { status: newData.statusCode })
  } catch (error: unknown) {
    console.log(error)
    return new Response(JSON.stringify(error), { status: 987})
  }
}
