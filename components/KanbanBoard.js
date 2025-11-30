'use client'

import { useState } from 'react'
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanColumn from './KanbanColumn'
import ProjectCard from './ProjectCard'

export default function KanbanBoard({ projects, onProjectUpdate, onBulkUpdate }) {
  const [activeId, setActiveId] = useState(null)
  const [selectedProjects, setSelectedProjects] = useState(new Set())

  const statuses = [
    { id: 'To Do', title: '📋 To Do', gradient: 'from-red-500 to-pink-500' },
    { id: 'In Progress', title: '🚀 In Progress', gradient: 'from-blue-500 to-purple-500' },
    { id: 'Done', title: '✅ Done', gradient: 'from-green-500 to-emerald-500' }
  ]

  const projectsByStatus = statuses.reduce((acc, status) => {
    acc[status.id] = projects.filter(p => p.internal_status === status.id)
    return acc
  }, {})

  function handleDragStart(event) {
    setActiveId(event.active.id)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    
    if (!over) {
      setActiveId(null)
      return
    }

    const projectId = active.id
    const newStatus = over.id

    // Find the project
    const project = projects.find(p => p.id === projectId)
    
    if (project && project.internal_status !== newStatus) {
      onProjectUpdate(projectId, { internal_status: newStatus })
    }

    setActiveId(null)
  }

  function handleDragCancel() {
    setActiveId(null)
  }

  function toggleSelection(projectId) {
    const newSelected = new Set(selectedProjects)
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId)
    } else {
      newSelected.add(projectId)
    }
    setSelectedProjects(newSelected)
  }

  function handleBulkAction(action) {
    if (selectedProjects.size === 0) {
      alert('No projects selected')
      return
    }

    const updates = {}
    
    if (action === 'mark-done') {
      updates.internal_status = 'Done'
    } else if (action === 'mark-in-progress') {
      updates.internal_status = 'In Progress'
    } else if (action === 'mark-todo') {
      updates.internal_status = 'To Do'
    }

    onBulkUpdate(Array.from(selectedProjects), updates)
    setSelectedProjects(new Set())
  }

  const activeProject = activeId ? projects.find(p => p.id === activeId) : null

  return (
    <div>
      {/* Bulk Actions Bar */}
      {selectedProjects.size > 0 && (
        <div className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-xl rounded-2xl p-4 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-white font-bold text-lg">
              ✨ {selectedProjects.size} selected
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleBulkAction('mark-todo')}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-bold transition"
              >
                📋 Move to To Do
              </button>
              <button
                onClick={() => handleBulkAction('mark-in-progress')}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-bold transition"
              >
                🚀 Move to In Progress
              </button>
              <button
                onClick={() => handleBulkAction('mark-done')}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-bold transition"
              >
                ✅ Move to Done
              </button>
              <button
                onClick={() => setSelectedProjects(new Set())}
                className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-xl font-bold transition"
              >
                ✕ Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Columns */}
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {statuses.map(status => (
            <KanbanColumn
              key={status.id}
              status={status}
              projects={projectsByStatus[status.id]}
              onProjectUpdate={onProjectUpdate}
              selectedProjects={selectedProjects}
              onToggleSelection={toggleSelection}
            />
          ))}
        </div>

        <DragOverlay>
          {activeProject ? (
            <div className="opacity-50">
              <ProjectCard
                project={activeProject}
                onUpdate={() => {}}
                isDragging={true}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
