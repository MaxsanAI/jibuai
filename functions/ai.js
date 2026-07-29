export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { type, prompt, messages } = body;

    // GENERISANJE SLIKA (Flux.1 Schnell)
    if (type === 'image') {
      const inputs = { prompt: prompt || "A futuristic smart assistant digital art" };
      const response = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', inputs);
      
      return new Response(response, {
        headers: { "Content-Type": "image/jpeg" }
      });
    }

    // GENERISANJE TEKSTA (Chat)
    const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { role: "system", content: "You are Jibu AI, a helpful, friendly, and lightning-fast assistant." },
        ...(messages || [])
      ]
    });

    return new Response(JSON.stringify({ success: true, result: response }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
