export async function onRequest(context) {
  const { request, env } = context;

  if (!env.IMPREZIA_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "Imprezia API key is not configured."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  try {
    const incomingUrl = new URL(request.url);

    const upstreamPath = incomingUrl.pathname.replace(/^\/imprezia/, "") || "/";
    const upstreamUrl = `https://api.imprezia.ai${upstreamPath}${incomingUrl.search}`;

    const headers = new Headers();

    const contentType = request.headers.get("Content-Type");
    const accept = request.headers.get("Accept");
    const sdkVersion = request.headers.get("X-SDK-Version");
    const userAgent = request.headers.get("User-Agent");
    const clientIp = request.headers.get("CF-Connecting-IP");

    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    if (accept) {
      headers.set("Accept", accept);
    }

    if (sdkVersion) {
      headers.set("X-SDK-Version", sdkVersion);
    }

    if (userAgent) {
      headers.set("X-Forwarded-User-Agent", userAgent);
    }

    if (clientIp) {
      headers.set("X-Forwarded-For", clientIp);
    }

    headers.set("X-API-Key", env.IMPREZIA_API_KEY);
    headers.set("X-SDK-Platform", "node");

    let body;

    if (request.method !== "GET" && request.method !== "HEAD") {
      body = await request.arrayBuffer();
    }

    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body
    });

    const responseHeaders = new Headers(upstreamResponse.headers);

    responseHeaders.delete("content-length");

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders
    });

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Imprezia proxy error.",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}
