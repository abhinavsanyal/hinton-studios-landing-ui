import type { APIRoute, GetStaticPaths } from 'astro';

export const getStaticPaths: GetStaticPaths = async () => {
  // Stub: no blog posts yet
  return [];
};

export const GET: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  return new Response(
    JSON.stringify({
      message: `GET /api/blog/posts/${slug} stub`
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
