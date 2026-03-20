import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDB } from '@/lib/Database/connectToDB'
import bcrypt from 'bcrypt'

import User from '@/models/user.model'

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          await connectToDB()

          // Search by email OR name
          const user = await User.findOne({
            $or: [
              { email: credentials.email },
              { name: credentials.email }
            ]
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  // inside auth.config.js
callbacks: {
  async jwt({ token, user }) {
    if (user) token.role = user.role; // Extract role from DB user
    return token;
  },
  async session({ session, token }) {
    if (token.role) session.user.role = token.role;
    return session;
  },
},
}