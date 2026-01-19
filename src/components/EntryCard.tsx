import Link from 'next/link'
import { Entry } from '@/types/database.types'

interface EntryCardProps {
  entry: Entry
  onDelete?: () => void
  isDeleting?: boolean
}

export default function EntryCard({ entry, onDelete, isDeleting = false }: EntryCardProps) {
  const formattedDate = new Date(entry.created_at).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

  return (
    <div className="card" style={{ minWidth: '600px' }}>
      <div className="mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="text-xs text-warm-gray mb-2 tracking-wide uppercase">
            {formattedDate}
          </div>
          {onDelete ? (
            <button
              type="button"
              className="btn-secondary px-3 py-1 text-xs"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          ) : null}
        </div>
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-serif text-dark-brown mb-3 flex-1">{entry.title}</h2>
          <Link href={`/entries/${entry.id}/edit`}>
            <span className="underline hover:text-warm-gray">Edit</span>
          </Link>
        </div>
      </div>
      <p className="text-dark-brown/80 leading-relaxed whitespace-pre-wrap" style={{ width: '550px' }}>
        {entry.content}
      </p>
    </div>
  )
}
