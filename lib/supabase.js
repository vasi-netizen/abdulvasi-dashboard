import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for database operations
export const db = {
  // Get all projects
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get projects by status
  async getProjectsByStatus(status) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('internal_status', status)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get pending projects (not published)
  async getPendingProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .neq('live_status', 'publish')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Update project
  async updateProject(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Delete project
  async deleteProject(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Bulk update projects
  async bulkUpdateProjects(ids, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .in('id', ids)
      .select()
    
    if (error) throw error
    return data
  },

  // Add new project
  async addProject(project) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Get all WordPress sites
  async getWordPressSites() {
    const { data, error } = await supabase
      .from('wordpress_sites')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Add WordPress site
  async addWordPressSite(site) {
    const { data, error } = await supabase
      .from('wordpress_sites')
      .insert([site])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Delete WordPress site
  async deleteWordPressSite(id) {
    const { error } = await supabase
      .from('wordpress_sites')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Search projects
  async searchProjects(query) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .or(`name.ilike.%${query}%,url.ilike.%${query}%,notes.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}
