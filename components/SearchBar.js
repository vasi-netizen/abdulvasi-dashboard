'use client'

import { motion } from 'framer-motion'

export default function SearchBar({ value, onChange }) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mb-8"
    >
      <div className="relative max-w-2xl mx-auto">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="🔍 Search projects by name, URL, or notes..."
          className="w-full bg-white/20 backdrop-blur-xl border-2 border-white/30 rounded-2xl px-6 py-4 text-white placeholder-white/60 font-semibold text-lg focus:outline-none focus:ring-4 focus:ring-pink-500/50 focus:border-white/50 transition shadow-xl"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold transition"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  )
}
