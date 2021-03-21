import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { ApolloServer, gql } from 'apollo-server-micro'

const ROOT = process.cwd()

const typeDefs = gql`
  type Snippet {
    slug: ID!
    short_description: String!
    types: [String]!
    mdSource: String!
  }

  type Query {
    snippets: [Snippet]!
  }
`

const resolvers = {
  Query: {
    snippets: async () => {
      const snippetFiles = await fs.readdir(path.join(ROOT, '_data'))
      const data = await Promise.all(
        snippetFiles.map(async file => {
          const slug = file.replace(/\.mdx?$/, '')
          const fileContent = await fs.readFile(path.join(ROOT, '_data', file))
          const { data, content } = matter(fileContent)
          return {
            ...data,
            slug,
            mdSource: content.trim(),
          }
        })
      )
      console.log(data)
      return data
    },
  },
}

const __DEV__ = process.env.NODE_ENV !== 'production'

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  debug: __DEV__,
})

export default server.createHandler({ path: '/api/v1/graphql' })
