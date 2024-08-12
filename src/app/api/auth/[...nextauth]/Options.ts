import type { NextAuthOptions  } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from 'next-auth/providers/credentials'

declare module 'next-auth' {
    interface Session {
      accessToken?: string;
    }

    interface JWT {
      accessToken?: string;
    }
  }

export const options: NextAuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    scope: 'openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.readonly',
                },
            },
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: {
                    label: "Username:",
                    type: "text",
                    placeholder: "your-cool-username"
                },
                password: {
                    label: "Password:",
                    type: "password",
                    placeholder: "your-awesome-password"
                }
            },
            async authorize(credentials) {
                const user = { id: "42", name: "Ganesh", password: "123456" }

                if (credentials?.username === user.name && credentials?.password === user.password) {
                    return user
                } else {
                    return null
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, account }) {
          if (account) {
            token.accessToken = account.access_token;
          }
          return token;
        },
        async session({ session, token }) {
          session.accessToken = token.accessToken as string;
          return session;
        },
      },
    };
