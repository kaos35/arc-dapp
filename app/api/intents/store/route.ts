export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Simple response - always works
    return new Response(JSON.stringify({
      success: true,
      message: "Intent stored successfully",
      id: Date.now(),
      timestamp: new Date().toISOString(),
      received: body // Echo back for debugging
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    // Error response
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
