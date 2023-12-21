import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface BookCardProps {
  title: string,
  author: string,
  image: string,
  url: string
}

export default function BookCard({ title, author, image, url }: BookCardProps) {
  return (
    <Card className="flex flex-col lg:flex-row gap-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex-shrink-0">
        <img
          alt={title}
          className="object-cover w-full h-60"
          src={image}
          style={{
            objectFit: "cover",
          }}
        />
      </div>
      <div className="flex flex-col justify-between h-full">
        <div>
          <h2 className="text-2xl font-bold text-gray-700">{title}</h2>
          <p className="text-lg text-gray-600">{author}</p>
        </div>
        <div>
          <Button className="mt-4" variant="outline">
            <Link href={url}>詳しく見る</Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}