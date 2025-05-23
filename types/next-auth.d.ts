import nextAuth from "next-auth";


declare module "next-auth" {
    interface Session {
        user: User,
        tokens:{
            accessToken: string,
            refreshToken: string
        }
    }
}