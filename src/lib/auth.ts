import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login', error: '/login' },

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const res = await fetch(`${BACKEND}/api/auth/credentials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })
          if (!res.ok) return null
          return res.json()
        } catch {
          return null
        }
      },
    }),

    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === 'google') {
          // Para OAuth, busca o CUID real do banco — user.id é o ID do Google,
          // não corresponde a nenhum registro na tabela users.
          try {
            const res = await fetch(`${BACKEND}/api/users/oauth`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(process.env.INTERNAL_API_SECRET
                  ? { 'x-internal-secret': process.env.INTERNAL_API_SECRET }
                  : {}),
              },
              body: JSON.stringify({ email: user.email, name: user.name }),
            })
            if (res.ok) {
              const dbUser = await res.json()
              token.id = dbUser.id
              token.role = dbUser.role ?? 'CUSTOMER'
            } else {
              token.id = user.id
              token.role = 'CUSTOMER'
            }
          } catch {
            token.id = user.id
            token.role = 'CUSTOMER'
          }
        } else {
          // Credentials: authorize já retorna o user com o CUID correto
          token.id = user.id
          token.role = user.role ?? 'CUSTOMER'
        }
      }
      return token
    },

    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  },
}
