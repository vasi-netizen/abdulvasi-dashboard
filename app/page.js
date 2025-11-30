'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/supabase'
import StatsBar from '@/components/StatsBar'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [viewMode, setViewMode] = useState('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSite, setSelectedSite] = useState(null)

  useEffect(() => {
    loadProjects()
    const interval = setInterval(() => {
      handleSync(true)
    }, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, viewMode, searchQuery, selectedSite])

  async function loadProjects() {
    try {
      setLoading(true)
      const data = viewMode === 'pending' 
        ? await db.getPendingProjects() 
        : await db.getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Load error:', error)
      alert('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  function filterProjects() {
    let filtered = [...projects]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.url?.toLowerCase().includes(query) ||
        p.notes?.toLowerCase().includes(query)
      )
    }

    if (selectedSite) {
      filtered = filtered.filter(p => 
        p.url.toLowerCase().includes(selectedSite.toLowerCase())
      )
    }

    setFilteredProjects(filtered)
  }

  async function handleSync(silent = false) {
    try {
      if (!silent) setSyncing(true)
      
      const response = await fetch('/api/sync', { method: 'POST' })
      const result = await response.json()
      
      if (result.success) {
        if (!silent) {
          alert(result.message)
        }
        await loadProjects()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Sync error:', error)
      if (!silent) {
        alert('Sync failed: ' + error.message)
      }
    } finally {
      setSyncing(false)
    }
  }

  async function handleImport() {
    try {
      setImporting(true)
      
      const response = await fetch('/api/import', { method: 'POST' })
      const result = await response.json()
      
      if (result.success) {
        alert(result.message)
        await loadProjects()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Import error:', error)
      alert('Import failed: ' + error.message)
    } finally {
      setImporting(false)
    }
  }

  async function handleProjectUpdate(projectId, updates) {
    try {
      await db.updateProject(projectId, updates)
      await loadProjects()
    } catch (error) {
      console.error('Update error:', error)
      alert('Update failed: ' + error.message)
    }
  }

  async function handleBulkUpdate(projectIds, updates) {
    try {
      await db.bulkUpdateProjects(projectIds, updates)
      await loadProjects()
    } catch (error) {
      console.error('Bulk update error:', error)
      alert('Bulk update failed: ' + error.message)
    }
  }

  const pendingCount = projects.filter(p => p.live_status !== 'publish').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-xl font-bold">Loading Dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/30 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 backdrop-blur-xl bg-white/10 border-b border-white/20 sticky top-0">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-3xl font-black bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent"
            >
              ✨ Abdul Vasi Dashboard
            </motion.h1>

            <div className="flex gap-3 flex-wrap items-center">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl px-4 py-2 text-white font-bold cursor-pointer hover:bg-white/30 transition"
              >
                <option value="pending" className="text-black">
                  🔥 Pending ({pendingCount})
                </option>
                <option value="all" className="text-black">
                  📊 All ({projects.length})
                </option>
              </select>

              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg hover:shadow-2xl transition transform hover:scale-105"
              >
                ➕ Add Site
              </button>

              <button
                onClick={() => handleSync()}
                disabled={syncing}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg hover:shadow-2xl transition transform hover:scale-105 disabled:opacity-50"
              >
                {syncing ? '⏳ Syncing...' : '⚡ Sync'}
              </button>

              <button
                onClick={handleImport}
                disabled={importing}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg hover:shadow-2xl transition transform hover:scale-105 disabled:opacity-50"
              >
                {importing ? '⏳ Importing...' : '📥 Import'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-6">
        <StatsBar 
          projects={projects} 
          onSiteClick={setSelectedSite}
          selectedSite={selectedSite}
        />

   

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredProjects.length === 0 ? (
    <div className="col-span-full text-center py-20 text-white/60 text-xl">
      No pending projects. Click Import to load drafts.
    </div>
  ) : (
    filteredProjects.map(project => (
      <ProjectCard
        key={project.id}
        project={project}
        onUpdate={handleProjectUpdate}
      />
    ))
  )}
</div>
      </div>

    
    </div>
  )
}
