import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  return new Response(
    JSON.stringify({
      message: "GET /api/blog/posts stub"
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
