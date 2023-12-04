import { Message } from 'ai'

import { cn } from '@/lib/utils'
import { IconOpenAI, IconUser } from '@/components/ui/icons'
import { Skeleton } from "@/components/ui/skeleton"

import BookList from './book-list'

export interface ChatMessageProps {
  message: Message
}

function isValidJSON(json: string) {
  try {
    JSON.parse(json);
    return true;
  } catch (e) {
    return false;
  }
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  const isValidContent = isValidJSON(message.content);

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
        {message.role === 'user' ? (
          message.content
        ) : isValidContent ? (
          <BookList recommendations={message.content} />
        ) : (
          // Render Skeleton when the content is not valid JSON
          <Skeleton />
        )}
      </div>
    </div>
  )
}
