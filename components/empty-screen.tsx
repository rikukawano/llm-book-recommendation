import { UseChatHelpers } from 'ai/react'
import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@/components/ui/icons'

const exampleMessages = [
  {
    heading: '1984のようなSF小説',
    message: `1984のようなSF小説`
  },
  {
    heading: '心がほっこりする現代ロマンス',
    message: '心がほっこりする現代ロマンス'
  },
  {
    heading: '太宰治の作品のようなバッドエンドがある小説',
    message: `太宰治の作品のようなバッドエンドがある小説`
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          こんにちは👋 わたしは本を紹介するAIです！
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          一緒に次の素晴らしい本を見つけましょう！信じてください、ページをめくるのが止まらないような本のことならお任せください！
        </p>
        <p className="leading-normal text-muted-foreground">
          これらの例から探し始めてもいいですよ👇
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
