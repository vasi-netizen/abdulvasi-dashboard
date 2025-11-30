'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/supabase'
import StatsBar from '@/components/StatsBar'
import ProjectCard from '@/components/ProjectCard'
import ManageSitesModal from '@/components/ManageSitesModal'
import AddSiteModal from '@/components/AddSiteModal'
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
  const [showManageSites, setShowManageSites] = useState(false)
  const [selectedSite, setSelectedSite] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

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
    setCurrentPage(1)
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

  const pendingCount = projects.filter(p => p.live_status !== 'publish').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-slate-500/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700 sticky top-0">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-3xl font-black text-white"
            >
              Abdul Vasi Dashboard
            </motion.h1>

            <div className="flex gap-3 flex-wrap items-center">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="bg-slate-700 border-2 border-slate-600 rounded-xl px-4 py-2 text-white font-bold cursor-pointer hover:bg-slate-600 transition"
              >
                <option value="pending">
                  Pending ({pendingCount})
                </option>
                <option value="all">
                  All ({projects.length})
                </option>
              </select>

              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold shadow-lg transition"
              >
                Add Site
              </button>
                  <button
  onClick={() => setShowManageSites(true)}
  className="bg-slate-600 hover:bg-slate-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg transition"
>
  Manage Sites
</button>

              <button
                onClick={() => handleSync()}
                disabled={syncing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold shadow-lg transition disabled:opacity-50"
              >
                {syncing ? 'Syncing...' : 'Sync'}
              </button>

              <button
                onClick={handleImport}
                disabled={importing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold shadow-lg transition disabled:opacity-50"
              >
                {importing ? 'Importing...' : 'Import'}
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

        <div className="mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search projects by name or URL..."
            className="w-full max-w-2xl mx-auto block bg-slate-800/50 backdrop-blur-xl border-2 border-slate-600 rounded-2xl px-6 py-4 text-white placeholder-slate-400 font-semibold text-lg focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-xl"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-400 text-xl">
              No pending projects. Click Import to load drafts.
            </div>
          ) : (
            filteredProjects
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                />
              ))
          )}
        </div>

        {filteredProjects.length > itemsPerPage && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold transition"
            >
              ← Previous
            </button>
            <span className="text-white font-bold">
              Page {currentPage} of {Math.ceil(filteredProjects.length / itemsPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredProjects.length / itemsPerPage), p + 1))}
              disabled={currentPage >= Math.ceil(filteredProjects.length / itemsPerPage)}
              className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <AddSiteModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            alert('Site added successfully!')
            loadProjects()
          }}
        />
      )}
        {showManageSites && (
  <ManageSitesModal
    onClose={() => setShowManageSites(false)}
    onSiteDeleted={() => {
      loadProjects()
    }}
  />
)}
    </div>
  )
}
