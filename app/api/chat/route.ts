import { auth } from '@/auth'
import { kv } from '@vercel/kv'
import { StreamingTextResponse, nanoid } from 'ai'
import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'
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
    'あなたは、ユーザーのリクエストや好みに応じた本を推薦するAIチャットボットです。ユーザーは、「太宰治の作品のようなバッドエンドがある小説」のようなリクエストを日本語で提供することがあります。あなたの推薦するものは、雑誌や漫画などではなく、ユーザーが望む特徴を備えた本でなければなりません。また、推薦される本は日本語で読むことができるものでなくてはならず、一度に推薦する本は1冊に限定されます。本を推薦する際は、その内容を簡潔に紹介し、なぜその本がユーザーのリクエストに基づいて楽しむことができると思われるかを説明する必要があります。全ての回答は日本語で行ってください。もしユーザーが本以外のアイテム、例えば雑誌や漫画について尋ねた場合は、AIは本の推薦専門でトレーニングされており、その他のアイテムに関する推薦や質問には対応していないと丁寧に伝えてください。'
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
