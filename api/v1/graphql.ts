import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { ApolloServer, gql } from 'apollo-server-micro'

const ROOT = process.cwd()

interface Snippet {
  slug: string
  short_description: string
  types: string[]
  mdSource: string
}

const fileToSnippet = (slug: string, contents: string | Buffer): Snippet => {
  const { data, content } = matter(contents)
  return {
    ...data,
    slug,
    mdSource: content.trim(),
  } as Snippet
}

const getAllSnippets = async (): Promise<Snippet[]> => {
  const snippetFiles = await fs.readdir(path.join(ROOT, '_data'))
  return Promise.all(
    snippetFiles.map(async file => {
      const slug = file.replace(/\.mdx?$/, '')
      const fileContent = await fs.readFile(path.join(ROOT, '_data', file))
      return fileToSnippet(slug, fileContent)
    })
  )
}

const getSnippet = async (slug: string): Promise<Snippet> => {
  try {
    const file = await fs.readFile(path.join(ROOT, '_data', slug + '.md'))
    return fileToSnippet(slug, file)
  } catch (err) {
    throw new Error('Snippet not found')
  }
}

const typeDefs = gql`
  type Snippet {
    slug: ID!
    short_description: String!
    types: [String]!
    mdSource: String!
  }

  type Query {
    snippets: [Snippet]!
    snippet(slug: ID!): Snippet
  }
`

const resolvers = {
  Query: {
    snippets: async () => {
      const data = await getAllSnippets()
      return data
    },
    snippet: async (_: any, { slug }: { slug: string }) => {
      return await getSnippet(slug)
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
