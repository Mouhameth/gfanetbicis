import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {

        if (req.nextUrl.pathname.startsWith("/home/admins") && req.nextauth.token?.role == "root") {
            return NextResponse.next();
        }
        if (req.nextUrl.pathname.startsWith("/home/medias")) {
            return NextResponse.next();
        }
        if (req.nextUrl.pathname.startsWith("/home/offices") && req.nextauth.token?.role == "root") {
            return NextResponse.next();
        }
        if (req.nextUrl.pathname.startsWith("/home/settings")) {
            return NextResponse.next();
        }
        if (req.nextUrl.pathname.startsWith("/home/report")) {
            return NextResponse.next();
        }
        if (req.nextUrl.pathname.startsWith("/home/time")) {
            return NextResponse.next();
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        }
    }
)

export const config = { matcher: ["/home/:path*", "/call/:path*", "/office/:path*", "/home/admins/:path*", "/office/admins/:path*",  "/root/:path*"] }