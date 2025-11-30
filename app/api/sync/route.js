import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { checkPostStatus } from '@/lib/wordpress'

export async function POST() {
  try {
    const projects = await db.getProjects()
    const sites = await db.getWordPressSites()

    // Create credentials map
    const credsMap = {}
    sites.forEach(site => {
      const key = site.site_url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
      credsMap[key] = {
        url: site.site_url,
        username: site.username,
        password: site.app_password
      }
    })

    let updatedCount = 0
    let deletedCount = 0

    // Check each project's status
    for (const project of projects) {
      const key = project.url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
      const creds = credsMap[key]

      if (!creds) continue

      const result = await checkPostStatus(
        creds.url,
        project.wordpress_id,
        creds.username,
        creds.password
      )

      // Delete if trashed or not found
   if (result.status === 'trash' || result.status === 'not_found' || result.status === 'publish') {
        await db.deleteProject(project.id)
        deletedCount++
        continue
      }

      // Update status if changed
      if (result.status !== 'error' && result.status !== project.live_status) {
        await db.updateProject(project.id, { live_status: result.status })
        updatedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync complete: ${updatedCount} updated, ${deletedCount} deleted`,
      updated: updatedCount,
      deleted: deletedCount
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
