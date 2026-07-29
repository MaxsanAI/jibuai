export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { role: "system", content: "You are Jibu AI, a helpful, friendly, and lightning-fast assistant." },
        ...(body.messages || [])
      ]
    });

    return new Response(JSON.stringify({ success: true, result: response }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
