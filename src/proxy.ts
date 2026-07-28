import { NextRequest, NextResponse } from "next/server.js";

import { decodeOperatorSession, getSessionSecret } from "./lib/auth-core.ts";

const sessionCookieName = "ooa_operator_session";

export function proxy(request: NextRequest) {
  if (process.env.PILOT_MODE !== "true") {
    return NextResponse.next();
  }

  const session = decodeOperatorSession(request.cookies.get(sessionCookieName)?.value, getSessionSecret());
  const expectedWorkspaceId = process.env.PILOT_WORKSPACE_ID?.trim() || "mills-trucking-pilot";
  if (!session || session.workspaceId !== expectedWorkspaceId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};
