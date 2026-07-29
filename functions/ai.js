export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { messages } = body;

    // Sistemski prompt podešen za maksimalnu inteligenciju, dubinu i tačnost odgovora
    const systemPrompt = {
      role: "system", 
      content: "You are Jibu AI, an exceptionally smart, helpful, accurate, and versatile digital assistant. Provide comprehensive, well-structured, precise, and thoughtful answers to any question or task requested by the user."
    };

    // Priprema istorije poruka za Llama 3.3 model
    const chatMessages = [
      systemPrompt,
      ...(Array.isArray(messages) ? messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })) : [])
    ];

    // Pokretanje moćnog Llama 3.3 70B modela preko Cloudflare AI bindings-a
    const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: chatMessages,
      max_tokens: 2048,
      temperature: 0.7
    });

    return new Response(JSON.stringify({ success: true, result: response }), {
      headers: { "Content-Type": "application/json" }
    });
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { messages } = body;

    // Sistemski prompt podešen za maksimalnu inteligenciju, dubinu i tačnost odgovora
    const systemPrompt = {
      role: "system", 
      content: "You are Jibu AI, an exceptionally smart, helpful, accurate, and versatile digital assistant. Provide comprehensive, well-structured, precise, and thoughtful answers to any question or task requested by the user."
    };

    // Priprema istorije poruka za Llama 3.3 model
    const chatMessages = [
      systemPrompt,
      ...(Array.isArray(messages) ? messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })) : [])
    ];

    // Pokretanje moćnog Llama 3.3 70B modela preko Cloudflare AI bindings-a
    const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: chatMessages,
      max_tokens: 2048,
      temperature: 0.7
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
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
