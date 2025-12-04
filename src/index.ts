// Cloudflare Worker handler for IntegrateWise
// Serves static assets and handles API requests

export default {
  async fetch(request: Request, env: any, ctx: any) {
    const url = new URL(request.url);
    
    // Add custom headers
    const response = await env.ASSETS.fetch(request);
    
    // Clone response to add headers
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('X-Powered-By', 'Cloudflare Workers');
    newResponse.headers.set('Cache-Control', 'public, max-age=3600');
    
    return newResponse;
  }
};
