import BookCard from '@/components/book-card'

export interface Book {
  title: string
  author: string
  reason: string
}

interface Recommendations {
  recommendations: Book[]
}

const BookList = ({ recommendations }: { recommendations: string }) => {
  let parsedRecommendations: Recommendations

  try {
    parsedRecommendations = JSON.parse(recommendations)
  } catch (error) {
    console.error('Error parsing recommendations JSON:', error)
    return <div>Unable to load recommendations.</div>
  }

  return (
    <div className="flex flex-col space-y-3">
      {parsedRecommendations.recommendations.map((book, index) => (
        <BookCard
          key={index}
          title={book.title}
          author={book.author}
          reason={book.reason}
        />
      ))}
    </div>
  )
}

export default BookList
