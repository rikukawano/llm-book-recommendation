import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import type { Book } from '@/components/book-list';

const BookCard = ({ title, author, reason }: Book) => {
  return (
    <Card className="w-full max-w-xs bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded p-4 m-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{author}</CardDescription>
      </CardHeader>
      <CardContent>
        <CardDescription>{reason}</CardDescription>
      </CardContent>
    </Card>
  )
}

export default BookCard
