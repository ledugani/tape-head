'use client';

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { getUserWantlist } from '@/lib/api'
import type { WantlistItem } from '@/types/api'

export default function WantlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [items, setItems] = useState<WantlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      const fetchWantlist = async () => {
        try {
          const data = await getUserWantlist()
          setItems(data)
          setError(null)
        } catch (err) {
          setError('Failed to load wantlist')
          console.error('Error fetching wantlist:', err)
        } finally {
          setLoading(false)
        }
      }

      fetchWantlist()
    }
  }, [isAuthenticated])

  if (authLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please log in to view your wantlist</h2>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div>Loading wantlist...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Wantlist</h1>
          {items.length === 0 ? (
            <p className="text-gray-500">Your wantlist is empty</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div key={item.id} className="bg-white shadow rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900">{item.tape.title}</h3>
                  <p className="text-sm text-gray-400">
                    {item.tape.year} • {item.tape.label}
                  </p>
                  {item.notes && (
                    <p className="mt-2 text-sm text-gray-600">{item.notes}</p>
                  )}
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Priority: {item.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 