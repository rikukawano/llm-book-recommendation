import { auth } from '@/auth'
import { kv } from '@vercel/kv'
import { StreamingTextResponse, nanoid } from 'ai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { ChatPromptTemplate, MessagesPlaceholder } from 'langchain/prompts'
import { StringOutputParser } from 'langchain/schema/output_parser'
import { RunnableSequence } from 'langchain/schema/runnable'
import { BufferMemory } from 'langchain/memory'
import { HumanMessage, SystemMessage } from 'langchain/schema'

export const runtime = 'edge'

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.9,
  streaming: true
})

/* Define function schema */
const searchBookByTitleOrAuthorFunctionSchema = {
  name: 'searchBookByTitleOrAuthor',
  description:
    'Retrieves book information by title or author from Rakuten API.',
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        description: 'The title of the book to search for.'
      },
      author: {
        type: 'string',
        minLength: 1,
        description: 'The author of the book to search for.'
      }
    },
    oneOf: [{ required: ['title'] }, { required: ['author'] }]
  }
}

const getBookModel = new ChatOpenAI({ modelName: 'gpt-4' }).bind({
  functions: [searchBookByTitleOrAuthorFunctionSchema],
  function_call: { name: 'searchBookByTitleOrAuthor' }
})

const memory = new BufferMemory({
  returnMessages: true, // returns messages as chat messages, instead of as strings
  inputKey: 'input',
  outputKey: 'output',
  memoryKey: 'history'
})

const chatPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    'あなたはユーザーのリクエストに沿って本を紹介します。本の内容を簡潔に紹介してから、ユーザーがなぜ読むべきなのか簡潔に述べてください。'
  ],
  new MessagesPlaceholder('history'),
  ['human', '{input}']
])

async function searchBookByTitleOrAuthor(title?: string, author?: string) {
  if (!title && !author) {
    throw new Error('Either title or author must be provided.')
  }

  const queryParams = new URLSearchParams({
    applicationId: '1057889994409955355',
    hits: '1',
    sort: 'reviewCount'
  })

  if (title) {
    queryParams.append('title', title)
  }
  if (author) {
    queryParams.append('author', author)
  }

  const url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?${queryParams.toString()}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log('API RESPONSE DATA ===> ', data)
    return data.Items.length > 0 ? data.Items[0].Item : null
  } catch (error) {
    console.error('There was an error fetching the book data:', error)
    throw error
  }
}

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json
  const userId = (await auth())?.user.id

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (previewToken) {
    model.openAIApiKey = previewToken
  }

  const outputParser = new StringOutputParser()

  const chain = RunnableSequence.from([
    {
      input: initialInput => initialInput.input,
      memory: () => memory.loadMemoryVariables({})
    },
    {
      input: previousOutput => previousOutput.input,
      history: previousOutput => previousOutput.memory.history
    },
    chatPrompt,
    model,
    outputParser
  ])

  const input = {
    input: messages[messages.length - 1].content
  }

  const result = await chain.stream(input, {
    callbacks: [
      {
        async handleLLMEnd(output) {
          // Search for book on Rakute Books
          const result = await getBookModel.invoke([
            new SystemMessage(
              "You will search for the book mentioned by the user's message"
            ),
            new HumanMessage(output.generations[0][0].text)
          ])
          if (
            result.additional_kwargs?.function_call?.name ===
            'searchBookByTitleOrAuthor'
          ) {
            const args = JSON.parse(
              result.additional_kwargs.function_call.arguments
            )
            if (args.title || args.author) {
              const response = await searchBookByTitleOrAuthor(
                args.title ? args.title : undefined,
                args.author ? args.author : undefined,
              )
            } else {
              console.error('Title or Author is required to search for a book.')
            }
          } else {
            console.error(
              'Unable to process message: Incorrect function call name or structure.'
            )
          }

          // Save latest message to memory
          await memory.saveContext(input, {
            output: output.generations[0][0].text
          })

          const title = json.messages[0].content.substring(0, 100)
          const id = json.id ?? nanoid()
          const createdAt = Date.now()
          const path = `/chat/${id}`
          const payload = {
            id,
            title,
            userId,
            createdAt,
            path,
            messages: [
              ...messages,
              {
                content: output.generations[0][0].text,
                role: 'assistant'
              }
            ]
          }
          await kv.hmset(`chat:${id}`, payload)
          await kv.zadd(`user:chat:${userId}`, {
            score: createdAt,
            member: `chat:${id}`
          })
        }
      }
    ]
  })

  return new StreamingTextResponse(result)
}
