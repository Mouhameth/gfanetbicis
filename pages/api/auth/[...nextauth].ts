import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
        // The name to display on the sign in form (e.g. "Sign in with...")
        name: "Credentials",
        // `credentials` is used to generate a form on the sign in page.
        // You can specify which fields should be submitted, by adding keys to the `credentials` object.
        // e.g. domain, username, password, 2FA token, etc.
        // You can pass any HTML attribute to the <input> tag through the object.
        credentials: { 
        
        },
        async authorize(credentials) {
          // Add  logic here to look up the user from the credentials supplied
          const {username, password}= credentials as any

          const res = await fetch(`${process.env.URL}/user/signin`,
          {
            method:"POST",
            headers:{
              "content-Type": "application/json",
            },
            body: JSON.stringify({username, password})
          });
          
          const user = await res.json();
          
          if (res.ok && user && user.active !== false) {
            // Any object returned will be saved in `user` property of the JWT
            return user
          } else if(user.active !== false){
            
          }
           else {
            // If you return null then an error will be displayed advising the user to check their details.
            return null
            // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
          }
        }
      })
  ],

  callbacks: {
    async jwt({token, user}){
      return {...token, ...user}
    },

    async session({session, token, user}) {
      session = token as any;
      return session;
    }
  }, 

  pages:{
    signIn: "/"
  }
})  