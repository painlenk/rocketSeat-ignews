import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { signIn } from "next-auth/react";
import { fauna } from "../../../services/fauna";
import { If, query as q } from "faunadb";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: "read:user",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const { email } = user
      try {
        await fauna.query(
          q.If( // se 
            q.Not( // nao
              q.Exists( // existir
                q.Match( // o match
                  q.Index('users_by_email'), // index da lista
                  q.Casefold(user.email) // valor procutado
                )
              )
            ),
            q.Create( // cria
              q.Collection('users'), // na collection 
              { data : { email } } // dentro de data o email 
            ),
            q.Get( // se nao vc pega
              q.Match( // o match 
                q.Index('users_by_email'), // no index
                q.Casefold(user.email) // com o valor
              )
            )
          )
        )
        return true
        
      } catch(e) {
        console.log("erro ->>", e)
        return false
      }
    },
  },
});
