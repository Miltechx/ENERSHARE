import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase/config"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials?.email as string,
            credentials?.password as string
          )
          return {
            id: userCredential.user.uid,
            email: userCredential.user.email,
            name: userCredential.user.displayName,
          }
        } catch (error) {
          return null
        }
      },
    }),
  ],
  pages: { signIn: "/auth/signin" },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
})

export { handler as GET, handler as POST }