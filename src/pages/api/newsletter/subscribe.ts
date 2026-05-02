import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  return new Response(
    JSON.stringify({
      message: "POST /api/newsletter/subscribe stub"
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
