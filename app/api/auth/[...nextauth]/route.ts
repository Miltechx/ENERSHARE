import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        // Demo mode - accept any credentials
        return { id: "1", email: credentials?.email, name: "Demo User" }
      }
    })
  ],
  pages: { signIn: "/auth/signin" },
  secret: process.env.NEXTAUTH_SECRET || "demo-secret",
})

export { handler as GET, handler as POST }
