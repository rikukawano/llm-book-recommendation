import { auth } from '@/auth'
import { kv } from '@vercel/kv'
import { StreamingTextResponse, nanoid } from 'ai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { ChatPromptTemplate, MessagesPlaceholder } from 'langchain/prompts'
import { StringOutputParser } from 'langchain/schema/output_parser'
import { RunnableSequence } from 'langchain/schema/runnable'
import { BufferMemory } from 'langchain/memory'

export const runtime = 'edge'

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.9,
  streaming: true
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
