'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getDomain } from '@/lib/wordpress'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

export default function ProjectCard({ project, onUpdate, isDragging, isSelected, onToggleSelection }) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(project.notes || '')
  const [deadline, setDeadline] = useState(project.deadline || '')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1
  }

  const domain = getDomain(project.url).toUpperCase()
  const isLive = project.live_status === 'publish'

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
    'border-pink-400',
    'border-purple-400',
    'border-blue-400',
    'border-green-400',
    'border-yellow-400',
    'border-orange-400',
    'border-red-400',
    'border-cyan-400'
  ]

  const hash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const borderColor = borderColors[hash % borderColors.length]

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl shadow-xl border-l-8 ${borderColor} overflow-hidden cursor-grab active:cursor-grabbing ${
        isSelected ? 'ring-4 ring-yellow-400 shadow-yellow-400/50' : ''
      }`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(project.id)}
              onClick={(e) => e.stopPropagation()}
              className="w-5 h-5 rounded cursor-pointer accent-pink-500"
            />
            <span className="text-xs font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              🌐 {domain}
            </span>
          </div>
          <div className={`bg-gradient-to-r ${statusGradient} px-3 py-1 rounded-full`}>
            <span className="text-xs font-bold text-white drop-shadow">
              {project.live_status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-slate-800 mb-3 line-clamp-2">
          {project.name}
        </h3>

        {/* Edit Link */}
        
          href={`${project.url}/wp-admin/post.php?post=${project.wordpress_id}&action=edit`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-800 mb-4 group"
        >
          <span>Edit in WordPress</span>
         <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
        </a>

        {/* Deadline */}
        {!isEditing && deadline && (
          <div className="mb-3 flex items-center gap-2 text-sm">
            <span className="text-slate-600">📅</span>
            <span className="font-semibold text-slate-700">
              {format(new Date(deadline), 'MMM dd, yyyy')}
            </span>
          </div>
        )}

        {/* Notes Display */}
        {!isEditing && notes && (
          <div className="mb-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{notes}</p>
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <div className="space-y-3 mb-3" onClick={(e) => e.stopPropagation()}>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
              rows={3}
              className="w-full bg-white border-2 border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-slate-200">
          {!isEditing ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition shadow-md"
            >
              ✏️ Edit Details
            </button>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSave()
                }}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition"
              >
                💾 Save
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setNotes(project.notes || '')
                  setDeadline(project.deadline || '')
                  setIsEditing(false)
                }}
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-800 px-4 py-2 rounded-lg font-bold text-sm transition"
              >
                ✕ Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
