'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/supabase'

export default function ManageSitesModal({ onClose, onSiteDeleted }) {
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    loadSites()
  }, [])

  async function loadSites() {
    try {
      setLoading(true)
      const data = await db.getWordPressSites()
      setSites(data)
    } catch (error) {
      console.error('Load sites error:', error)
      alert('Failed to load sites')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(siteId, siteName) {
    if (!confirm(`Are you sure you want to remove "${siteName}"? This will not delete projects, only the site connection.`)) {
      return
    }

    try {
      setDeleting(siteId)
      await db.deleteWordPressSite(siteId)
      setSites(sites.filter(s => s.id !== siteId))
      alert('Site removed successfully!')
      onSiteDeleted()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete site: ' + error.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-indigo-900 p-8 rounded-3xl max-w-3xl w-full shadow-2xl relative border-2 border-white/20 max-h-[80vh] overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl font-bold transition"
        >
          ✕
        </button>

        <h2 className="text-3xl font-black text-white mb-6 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
          Manage WordPress Sites
        </h2>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading sites...</p>
          </div>
        ) : sites.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-white/60 text-lg">No sites added yet</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 space-y-3">
            {sites.map(site => (
              <div
                key={site.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">
                      {site.site_name || site.site_url}
                    </h3>
                    <p className="text-white/60 text-sm mb-2">{site.site_url}</p>
                    <div className="flex gap-4 text-xs text-white/50">
                      <span>Username: {site.username}</span>
                      <span>Added: {new Date(site.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(site.id, site.site_name || site.site_url)}
                    disabled={deleting === site.id}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold text-sm transition"
                  >
                    {deleting === site.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/20">
          <button
            onClick={onClose}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
