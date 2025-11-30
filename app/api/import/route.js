import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { fetchDrafts } from '@/lib/wordpress'

export async function POST() {
  try {
    const sites = await db.getWordPressSites()
    const existingProjects = await db.getProjects()
    
    // Create a Set of existing WordPress IDs for fast lookup
    const existingIds = new Set(
      existingProjects.map(p => `${p.url}|${p.wordpress_id}`)
    )

    let newProjects = []

    // Fetch drafts from each site
    for (const site of sites) {
      const drafts = await fetchDrafts(
        site.site_url,
        site.username,
        site.app_password
      )

      // Filter out existing projects
    drafts.forEach(draft => {
  const key = `${draft.url}|${draft.wordpress_id}`
  if (!existingIds.has(key)) {
    newProjects.push({
      name: draft.name,
      url: draft.url,
      wordpress_id: draft.wordpress_id,
      live_status: draft.live_status,
      internal_status: 'To Do',
      notes: null,
      deadline: null
    })
  }
      })
    }

    // Insert new projects
    if (newProjects.length > 0) {
      for (const project of newProjects) {
        await db.addProject(project)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${newProjects.length} new items`,
      count: newProjects.length
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
