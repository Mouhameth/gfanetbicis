import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
      const { pathname } = req.nextUrl;
      const token: any = req.nextauth.token;
  
      // Vérification des rôles
      const userRole = token?.user?.role?.name || token?.role;
  
      // Routes accessibles pour le rôle "root"
      const rootRoutes = [
        "/home/admins",
        "/home/offices",
        "/home/settings",
        "/home/report",
        "/home/time",
      ];
  
      if (pathname === "/home/alert" && userRole !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
  
      if (pathname === "/home/devis" && userRole !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
  
      if (rootRoutes.some((route) => pathname.startsWith(route)) && userRole !== "root") {
        return NextResponse.redirect(new URL("/", req.url));
      }
  
      if (pathname.startsWith("/home/medias")) {
        return NextResponse.next();
      }

      if (pathname.startsWith("/home")) {
        return NextResponse.next();
      }
  
      // Redirection par défaut pour les chemins non autorisés
      return NextResponse.redirect(new URL("/", req.url));
    },
    {
      callbacks: {
        authorized: ({ token }) => !!token, // Vérification si l'utilisateur est authentifié
      },
    }
  );
  
  export const config = { matcher: ["/home/:path*"] };