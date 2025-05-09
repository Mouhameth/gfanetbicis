import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
      const { pathname } = req.nextUrl;
      const token: any = req.nextauth.token;
  
      // Vérification des rôles
      const userRole = token?.user?.role?.name || token?.role;
  
    const rootRoutes = [
      "/home",
      "/home/admins",
      "/home/offices",
      "/home/settings",
      "/home/report",
      "/home/time",
      "/home/medias",
      "/home/devis",
      "/home/alert"
    ];

    const adminsRoutes = [
      "/home",
      "/home/offices",
      "/home/settings",
      "/home/report",
      "/home/time",
      "/home/devis",
      "/home/alert"
    ];

    const marketingRoutes = [
      "/home",
      "/home/offices",
      "/home/report",
      "/home/medias",
      "/home/settings"
    ];

    const adminOfficeRoutes = [
      "/office",
      "/home/settings"
    ];


    if (userRole === "root") {
      if (!rootRoutes.some((route) => pathname === route)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    if (userRole === "admin") {
      if (!adminsRoutes.some((route) => pathname === route)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    if (userRole === "marketing") {
      if (!marketingRoutes.some((route) => pathname === route)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
    if (userRole === "user") {
      if (!adminOfficeRoutes.some((route) => pathname === route)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
    },
    {
      callbacks: {
        authorized: ({ token }) => !!token, // Vérification si l'utilisateur est authentifié
      },
    }
  );
  
  export const config = { matcher: ["/home/:path*"] };