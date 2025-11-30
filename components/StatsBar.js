'use client'

import { motion } from 'framer-motion'
import { getDomain } from '@/lib/wordpress'

export default function StatsBar({ projects, onSiteClick, selectedSite }) {
  // Get unique domains only
  const uniqueDomains = [...new Set(projects.map(p => getDomain(p.url)))]
  
  // Calculate stats per unique domain
  const stats = {}
  uniqueDomains.forEach(domain => {
    const domainProjects = projects.filter(p => getDomain(p.url) === domain)
    stats[domain] = {
      pending: domainProjects.filter(p => p.live_status !== 'publish').length,
      total: domainProjects.length
    }
  })

  const totalPending = projects.filter(p => p.live_status !== 'publish').length

  const gradients = [
    'from-blue-400 to-cyan-400',
    'from-indigo-400 to-blue-400',
    'from-cyan-400 to-teal-400',
    'from-emerald-400 to-green-400',
    'from-teal-400 to-cyan-400',
    'from-sky-400 to-blue-400',
    'from-violet-400 to-indigo-400',
    'from-blue-400 to-indigo-400',
  ]

  const getGradient = (index) => gradients[index % gradients.length]

  return (
    <div className="mb-8 overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => onSiteClick(null)}
          className={`cursor-pointer bg-gradient-to-br from-blue-500 via-cyan-500 to-indigo-600 p-6 rounded-3xl shadow-2xl min-w-[200px] transform transition ${
            selectedSite === null ? 'ring-4 ring-white/50 shadow-cyan-500/50' : ''
          }`}
        >
          <div className="text-white">
            <div className="text-6xl font-black mb-2 drop-shadow-lg">{totalPending}</div>
            <div className="text-sm font-bold uppercase tracking-wider opacity-90">
              Total Pending
            </div>
          </div>
        </motion.div>

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
                {domain}
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
