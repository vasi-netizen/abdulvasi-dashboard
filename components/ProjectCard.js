'use client'

import { useState } from 'react'
import { getDomain } from '@/lib/wordpress'
import { format } from 'date-fns'

export default function ProjectCard({ project, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(project.notes || '')
  const [deadline, setDeadline] = useState(project.deadline || '')

  const domain = getDomain(project.url).toUpperCase()

  const statusColors = {
    draft: 'from-yellow-400 to-orange-400',
    pending: 'from-blue-400 to-cyan-400',
    publish: 'from-green-400 to-emerald-400',
    private: 'from-purple-400 to-pink-400'
  }

  const statusGradient = statusColors[project.live_status] || 'from-gray-400 to-slate-400'

  function handleSave() {
    onUpdate(project.id, { notes, deadline: deadline || null })
    setIsEditing(false)
  }

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

        <h3 className="font-bold text-xl text-slate-800 mb-4 line-clamp-2 min-h-[56px]">
          {project.name}
        </h3>

        
          href={`${project.url}/wp-admin/post.php?post=${project.wordpress_id}&action=edit`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 mb-4 transition-colors"
        >
          <span>Edit in WordPress</span>
          <span className="transition-transform group-hover:translate-x-1">&#8594;</span>
        </a>

        {!isEditing && deadline && (
          <div className="mb-4 flex items-center gap-2 text-sm bg-blue-50 p-3 rounded-lg">
            <span className="text-slate-600">📅</span>
            <span className="font-semibold text-slate-700">
              Due: {format(new Date(deadline), 'MMM dd, yyyy')}
            </span>
          </div>
        )}

        {!isEditing && notes && (
          <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{notes}</p>
          </div>
        )}

        {isEditing && (
          <div className="space-y-3 mb-4 bg-slate-50 p-4 rounded-lg border-2 border-indigo-200">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-white border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this project..."
                rows={4}
                className="w-full bg-white border-2 border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-slate-200">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg"
            >
              ✏️ Edit Details
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-all"
              >
                💾 Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setNotes(project.notes || '')
                  setDeadline(project.deadline || '')
                  setIsEditing(false)
                }}
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-800 px-4 py-2.5 rounded-lg font-bold text-sm transition-all"
              >
                ✕ Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
