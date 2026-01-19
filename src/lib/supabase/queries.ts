import { Entry, NewEntry } from '@/types/database.types'

/**
 * Fetch all entries for the authenticated user
 */
export async function getEntries(): Promise<Entry[]> {
  const response = await fetch('/api/entries')
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to load entries')
  }

  return data.entries || []
}

/**
 * Create a new entry for the authenticated user
 */
export async function createEntry(entry: NewEntry): Promise<Entry> {
  const response = await fetch('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create entry')
  }

  return data.entry
}
