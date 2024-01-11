import { nanoid } from 'ai'
import OpenAI from 'openai'
import { ChatCompletionTool } from 'openai/resources/chat/completions'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// Set the runtime to edge
export const runtime = 'edge'

// Function definition
const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_book_by_title',
      description: 'Get the book information by title from Rakuten Books API',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'The title of the book to search for'
          }
        },
        required: ['title']
      }
    }
  }
]

async function searchBookByTitle(title: string) {
  if (!title) {
    throw new Error('Title must be provided.')
  }

  const queryParams = new URLSearchParams({
    applicationId: '1057889994409955355',
    hits: '1',
    sort: 'reviewCount',
    title: title
  })

  const url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?${queryParams.toString()}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.Items.length > 0 ? data.Items[0].Item : null
  } catch (error) {
    throw new Error(`There was an error fetching the book data: ${error}`)
  }
}

function formatBookObj(book: any) {
  return {
    title: book.title,
    author: book.author,
    itemUrl: book.itemUrl,
    largeImageUrl: book.largeImageUrl,
    reviewAverage: book.reviewAverage,
    reviewCount: book.reviewCount
  }
}

export async function POST(request: Request) {
  const message = await request.json()

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0613',
    messages: [
      {
        role: 'system',
        content:
          'ユーザーのメッセージに含まれている本を抽出して検索をしてください。検索するには本のタイトルが必要です。'
      },
      { role: 'user', content: message }
    ],
    tools: tools,
    tool_choice: {
      type: 'function',
      function: { name: 'search_book_by_title' }
    }
  })

  const firstChoice = response.choices?.[0]
  const toolCalls = firstChoice?.message?.tool_calls
  let responseData = {}
  if (toolCalls && toolCalls.length > 0) {
    const functionArguments = toolCalls[0]?.function?.arguments
    try {
      const argsObject = JSON.parse(functionArguments)
      if (argsObject.title) {
        const bookObj = await searchBookByTitle(argsObject.title)
        const book = formatBookObj(bookObj)
        responseData = {
          id: nanoid(),
          content: book,
          role: 'assistant'
        }
      } else {
        throw new Error('Book title is missing in the arguments.')
      }
    } catch (error) {
      console.error(
        'Error processing function arguments or searching for book:',
        error
      )
    }
  } else {
    console.error(
      'No tool calls present in the response or the structure is not as expected.'
    )
  }
  return Response.json(responseData)
}