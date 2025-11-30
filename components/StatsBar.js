'use client'

import { motion } from 'framer-motion'
import { getDomain } from '@/lib/wordpress'

export default function StatsBar({ projects, onSiteClick, selectedSite }) {
  // Calculate stats per site
  const stats = {}
  projects.forEach(project => {
    const domain = getDomain(project.url)
    if (!stats[domain]) {
      stats[domain] = { pending: 0, total: 0 }
    }
    stats[domain].total++
    if (project.live_status !== 'publish') {
      stats[domain].pending++
    }
  })

  const totalPending = projects.filter(p => p.live_status !== 'publish').length

  const gradients = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-yellow-500 to-orange-500',
    'from-red-500 to-pink-500',
    'from-indigo-500 to-purple-500',
    'from-cyan-500 to-blue-500',
  ]

  const getGradient = (index) => gradients[index % gradients.length]

  return (
    <div className="mb-8 overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {/* Total Card - Extra Vibrant */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => onSiteClick(null)}
          className={`cursor-pointer bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-6 rounded-3xl shadow-2xl min-w-[200px] transform transition ${
            selectedSite === null ? 'ring-4 ring-white/50 shadow-yellow-500/50' : ''
          }`}
        >
          <div className="text-white">
            <div className="text-6xl font-black mb-2 drop-shadow-lg">{totalPending}</div>
            <div className="text-sm font-bold uppercase tracking-wider opacity-90">
              🔥 Total Pending
            </div>
          </div>
        </motion.div>

        {/* Site Cards */}
        {Object.keys(stats).map((domain, index) => (
          <motion.div
            key={domain}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -5 }}
            onClick={() => onSiteClick(domain)}
            className={`cursor-pointer bg-gradient-to-br ${getGradient(index)} p-6 rounded-3xl shadow-xl min-w-[220px] transform transition backdrop-blur-sm ${
              selectedSite === domain ? 'ring-4 ring-white/60 shadow-2xl' : ''
            }`}
          >
            <div className="text-white">
              <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80 truncate" title={domain}>
                🌐 {domain}
              </div>
              <div className="flex items-end gap-3">
                <div className="text-5xl font-black drop-shadow-lg">
                  {stats[domain].pending}
                </div>
                <div className="text-sm font-bold mb-2 opacity-90">
                  / {stats[domain].total} total
                </div>
              </div>
              <div className="text-xs font-semibold mt-2 opacity-75">
                PENDING TASKS
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
