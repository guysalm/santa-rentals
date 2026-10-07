import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Paths that live outside the localized [lang] tree.
const UNLOCALIZED = /^\/(api|a|admin|agent|login|auth)(\/|$)/;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files and app icons pass through. (opengraph-image lives under [lang]
  // and is rewritten like a page.)
  if (/\.[a-z0-9]+$/i.test(pathname) || /^\/(icon|apple-icon)/.test(pathname)) return NextResponse.next();

  if (UNLOCALIZED.test(pathname)) {
    if (/^\/(admin|agent)(\/|$)/.test(pathname)) return refreshSession(request);
    return NextResponse.next();
  }

  // /en/... is never public — English is served unprefixed.
  if ((pathname === "/en" || pathname.startsWith("/en/")) && !pathname.endsWith("/opengraph-image")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/es" || pathname.startsWith("/es/")) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

/** Keep Supabase auth cookies fresh and bounce anonymous visitors to /login. */
async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(toSet) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(login);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
