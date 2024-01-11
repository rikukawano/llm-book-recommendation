import { UseChatHelpers } from 'ai/react'
import { Button } from '@/components/ui/button'

const exampleMessages = [
  {
    heading: 'ジャンルで探す',
    message: `一九八四年のようなディストピア小説`
  },
  {
    heading: '気分で探す',
    message: '愛でほっこりと暖かい気持ちになる本'
  }
]

export function ExampleMessageButton({
  setInput
}: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mt-4 flex flex-row space-x-4">
      {exampleMessages.map((message, index) => (
        <Button
          key={index}
          variant="outline"
          onClick={() => setInput(message.message)}
          className="p-6 text-sm"
        >
          {message.heading}
        </Button>
      ))}
    </div>
  )
}
