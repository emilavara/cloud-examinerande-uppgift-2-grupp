'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import EntryCard from '@/components/EntryCard'
import { getEntries } from '@/lib/supabase/queries'
import { getCurrentUser } from '@/lib/supabase/auth'
import { Entry } from '@/types/database.types'
import Link from 'next/link'

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export default function DashboardPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUser()

        if (!user) {
          router.push('/login')
          return
        }

        const data = await getEntries()
        setEntries(data)
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load entries'))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  async function handleDelete(entryId: string) {
    const confirmed = window.confirm('Are you sure you want to delete this entry?')

    if (!confirmed) {
      return
    }

    setDeletingId(entryId)
    setError(null)

    try {
      const response = await fetch(`/api/entries?id=${encodeURIComponent(entryId)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || 'Failed to delete entry')
      }

      setEntries((prev) => prev.filter((entry) => entry.id !== entryId))
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete entry'))
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-warm-gray text-center">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    )
  }

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredEntries = entries.filter((entry) => {
    if (!normalizedQuery) {
      return true
    }
    const titleMatch = entry.title.toLowerCase().includes(normalizedQuery)
    const textMatch = entry.content.toLowerCase().includes(normalizedQuery)
    return titleMatch || textMatch
  })

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto py-12" style={{ paddingLeft: '80px', paddingRight: '80px' }}>
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-serif text-dark-brown mb-2">Your Entries</h2>
            <p className="text-warm-gray text-sm">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
          <Link href="/new-entry">
            <button className="btn-primary" style={{ minWidth: '160px' }}>
              New Entry
            </button>
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-warm-gray mb-6">You haven&apos;t written any entries yet.</p>
            <Link href="/new-entry">
              <button className="btn-secondary">Write your first entry</button>
            </Link>
          </div>
        ) : (
          <>
            <form className="mb-8" onSubmit={(event) => event.preventDefault()}>
              <label htmlFor="search-query" className="block text-sm text-warm-gray mb-2">
                Search in title or text
              </label>
              <input
                id="search-query"
                type="text"
                className="w-full rounded-md border border-warm-gray/40 px-3 py-2 bg-white"
                placeholder="Type a keyword"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </form>

            {filteredEntries.length === 0 ? (
              <p className="text-warm-gray text-center">No entries match your search.</p>
            ) : (
              <div className="space-y-8">
                {filteredEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={() => handleDelete(entry.id)}
                    isDeleting={deletingId === entry.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
