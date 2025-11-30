'use client'

import { getDomain } from '@/lib/wordpress'
import { format } from 'date-fns'

export default function ProjectCard({ project }) {
  const domain = getDomain(project.url).toUpperCase()

  const statusColors = {
    draft: 'from-yellow-400 to-orange-400',
    pending: 'from-blue-400 to-cyan-400',
    publish: 'from-green-400 to-emerald-400',
    private: 'from-purple-400 to-pink-400'
  }

  const statusGradient = statusColors[project.live_status] || 'from-gray-400 to-slate-400'

  const borderColors = [
    'border-blue-400',
    'border-cyan-400',
    'border-teal-400',
    'border-green-400',
    'border-emerald-400',
    'border-sky-400',
    'border-indigo-400',
    'border-violet-400'
  ]

  const hash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const borderColor = borderColors[hash % borderColors.length]

  return (
    <div className={`bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border-l-8 ${borderColor} overflow-hidden hover:shadow-2xl transition-all duration-300`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {domain}
          </span>
          <div className={`bg-gradient-to-r ${statusGradient} px-3 py-1 rounded-full`}>
            <span className="text-xs font-bold text-white drop-shadow">
              {project.live_status.toUpperCase()}
            </span>
          </div>
        </div>

        <h3 className="font-bold text-xl text-slate-800 mb-4 line-clamp-3 min-h-[84px]">
          {project.name}
        </h3>

        {project.deadline && (
          <div className="mb-4 flex items-center gap-2 text-sm bg-blue-50 p-3 rounded-lg">
            <span>Due: {format(new Date(project.deadline), 'MMM dd, yyyy')}</span>
          </div>
        )}

        {project.notes && (
          <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
            <p className="text-sm text-slate-700 line-clamp-2">{project.notes}</p>
          </div>
        )}

        
          href={`${project.url}/wp-admin/post.php?post=${project.wordpress_id}&action=edit`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-4 py-3 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg"
        >
          Edit in WordPress
        </a>
      </div>
    </div>
  )
}
