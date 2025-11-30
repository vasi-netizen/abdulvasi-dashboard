'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import ProjectCard from './ProjectCard'
import { motion } from 'framer-motion'

export default function KanbanColumn({ status, projects, onProjectUpdate, selectedProjects, onToggleSelection }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      {/* Column Header */}
      <div className={`bg-gradient-to-r ${status.gradient} p-4 rounded-t-3xl shadow-lg`}>
        <h2 className="text-white font-black text-xl flex items-center justify-between">
          <span>{status.title}</span>
          <span className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
            {projects.length}
          </span>
        </h2>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 bg-white/10 backdrop-blur-md rounded-b-3xl p-4 min-h-[500px] transition ${
          isOver ? 'ring-4 ring-white/50 bg-white/20' : ''
        }`}
      >
        <SortableContext
          items={projects.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="text-white/40 text-center py-10 font-semibold">
                No projects here yet
              </div>
            ) : (
              projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onUpdate={onProjectUpdate}
                  isSelected={selectedProjects.has(project.id)}
                  onToggleSelection={onToggleSelection}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </motion.div>
  )
}
