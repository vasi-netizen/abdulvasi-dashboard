'use client'

import { useState } from 'react'
import { db } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

export default function AddSiteModal({ onClose, onSuccess }) {
  const [url, setUrl] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [siteName, setSiteName] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!url || !username || !password) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      
      // Normalize URL
      let normalizedUrl = url.trim()
      if (!normalizedUrl.startsWith('http')) {
        normalizedUrl = 'https://' + normalizedUrl
      }
      if (normalizedUrl.endsWith('/')) {
        normalizedUrl = normalizedUrl.slice(0, -1)
      }

      await db.addWordPressSite({
        site_url: normalizedUrl,
        username: username.trim(),
        app_password: password.trim(),
        site_name: siteName.trim() || null
      })

      onSuccess()
    } catch (error) {
      console.error('Add site error:', error)
      alert('Failed to add site: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-purple-900 to-pink-900 p-8 rounded-3xl max-w-md w-full shadow-2xl relative border-2 border-white/20"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl font-bold transition"
          >
            ✕
          </button>

          {/* Title */}
          <h2 className="text-3xl font-black text-white mb-6 bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
            ➕ Add WordPress Site
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white font-bold mb-2 text-sm">
                Site URL <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-pink-500/50 focus:border-white/50 transition"
                required
              />
            </div>

            <div>
              <label className="block text-white font-bold mb-2 text-sm">
                Site Name (Optional)
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="My Awesome Site"
                className="w-full bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-pink-500/50 focus:border-white/50 transition"
              />
            </div>

            <div>
              <label className="block text-white font-bold mb-2 text-sm">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-pink-500/50 focus:border-white/50 transition"
                required
              />
            </div>

            <div>
              <label className="block text-white font-bold mb-2 text-sm">
                App Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                className="w-full bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-pink-500/50 focus:border-white/50 transition"
                required
              />
              <p className="text-xs text-white/60 mt-2">
                Generate this in WordPress: Users → Profile → Application Passwords
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-4 rounded-xl font-black text-lg shadow-xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '⏳ Saving...' : '💾 Save Site'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
