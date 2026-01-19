import Link from 'next/link'
import { Entry } from '@/types/database.types'

interface EntryCardProps {
  entry: Entry
}

export default function EntryCard({ entry }: EntryCardProps) {
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
        <div className="text-xs text-warm-gray mb-2 tracking-wide uppercase">
          {formattedDate}
        </div>
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-serif text-dark-brown mb-3 flex-1">{entry.title}</h2>
          <Link href={`/entries/${entry.id}/edit`}>
            {/* <button className="btn-secondary text-sm" style={{ minWidth: '90px' }}>
              Edit
            </button> */}
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
