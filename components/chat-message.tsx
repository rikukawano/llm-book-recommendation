import { Message } from 'ai'

import { cn } from '@/lib/utils'
import { IconOpenAI, IconUser } from '@/components/ui/icons'
import { MemoizedReactMarkdown } from './markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { CodeBlock } from './ui/codeblock'
import BookCard from './book-card'

export interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  const isObject = typeof message.content == 'object'

  const messageBody = isObject ? (
    <BookCard
      title={message.content.title}
      author={message.content.author}
      image={message.content.largeImageUrl}
      url={message.content.itemUrl}
    />
  ) : (
    <MemoizedReactMarkdown
      className="prose break-words prose-p:leading-relaxed prose-pre:p-0"
      remarkPlugins={[remarkGfm, remarkMath]}
      components={{
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>
        },
        code({ node, inline, className, children, ...props }) {
          if (children.length) {
            if (children[0] == '▍') {
              return (
                <span className="mt-1 cursor-default animate-pulse">▍</span>
              )
            }

            children[0] = (children[0] as string).replace('`▍`', '▍')
          }

          const match = /language-(\w+)/.exec(className || '')

          if (inline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }

          return (
            <CodeBlock
              key={Math.random()}
              language={(match && match[1]) || ''}
              value={String(children).replace(/\n$/, '')}
              {...props}
            />
          )
        }
      }}
    >
      {message.content}
    </MemoizedReactMarkdown>
  )

  return (
    <div
      className={cn('group relative mb-4 flex items-start md:-ml-12')}
      {...props}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
          message.role === 'user'
            ? 'bg-background'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {message.role === 'user' ? <IconUser /> : <IconOpenAI />}
      </div>
      <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
        {messageBody}
      </div>
    </div>
  )
}
