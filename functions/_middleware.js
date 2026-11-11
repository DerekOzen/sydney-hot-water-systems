// Nifty — redirect handler (Cloudflare Pages Function). v2
// Managed by the dashboard — 301 Redirect Bulk Delete & Replace. Do not edit by hand.
//
// Two safe jobs:
//  1) If this site has a live custom domain, send the Cloudflare *.pages.dev duplicate
//     address to that domain with a 301 (so the pages.dev copy doesn't linger or get indexed).
//  2) Case-insensitive redirects: Cloudflare matches _redirects case-sensitively, so a visit
//     like /tiler-Parramatta/ never fires the /tiler-parramatta/ rule. ONLY when a page would
//     otherwise 404, we send a mixed-case page path to its lowercase form, where the rule lives.
//
// Safe by design: the case fix runs AFTER normal serving and only on a genuine 404, so real
// pages, assets and existing redirects are untouched; a path that looks like a file is left alone.

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // Health check — lets the dashboard confirm the handler is live on a site.
  if (url.pathname.toLowerCase() === "/__nifty-redirect-handler") {
    return new Response("nifty-redirect-handler-ok", {
      status: 200,
      headers: { "content-type": "text/plain", "cache-control": "no-store", "x-robots-tag": "noindex" },
    });
  }

  const res = await next();
  if (res.status !== 404) return res;

  const path = url.pathname;
  const last = path.split("/").pop() || "";
  const looksLikeFile = /\.[a-z0-9]{1,8}$/i.test(last);
  const lower = path.toLowerCase();
  if (!looksLikeFile && lower !== path) {
    url.pathname = lower;
    return Response.redirect(url.toString(), 301);
  }
  return res;
}
