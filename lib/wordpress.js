// WordPress REST API helpers

export async function checkPostStatus(siteUrl, postId, username, appPassword) {
  try {
    const auth = Buffer.from(`${username}:${appPassword}`).toString('base64')
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }

    // Try posts first
    let response = await fetch(`${siteUrl}/wp-json/wp/v2/posts/${postId}`, {
      headers,
      cache: 'no-store'
    })

    if (response.ok) {
      const data = await response.json()
      return {
        status: data.status,
        title: data.title.rendered,
        type: 'post'
      }
    }

    // If not found, try pages
    if (response.status === 404) {
      response = await fetch(`${siteUrl}/wp-json/wp/v2/pages/${postId}`, {
        headers,
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()
        return {
          status: data.status,
          title: data.title.rendered,
          type: 'page'
        }
      }
    }

    return { status: 'not_found', title: null, type: null }
  } catch (error) {
    console.error('WordPress API Error:', error)
    return { status: 'error', title: null, type: null }
  }
}

export async function fetchDrafts(siteUrl, username, appPassword) {
  try {
    const auth = Buffer.from(`${username}:${appPassword}`).toString('base64')
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }

    const drafts = []

    // Fetch draft posts
    const postsResponse = await fetch(
      `${siteUrl}/wp-json/wp/v2/posts?status=draft,pending&per_page=50`,
      { headers, cache: 'no-store' }
    )

    if (postsResponse.ok) {
      const posts = await postsResponse.json()
      posts.forEach(post => {
        drafts.push({
          name: post.title.rendered || '(No Title)',
          url: siteUrl,
          wordpress_id: post.id,
          live_status: post.status,
          internal_status: 'To Do'
        })
      })
    }

    // Fetch draft pages
    const pagesResponse = await fetch(
      `${siteUrl}/wp-json/wp/v2/pages?status=draft,pending&per_page=50`,
      { headers, cache: 'no-store' }
    )

    if (pagesResponse.ok) {
      const pages = await pagesResponse.json()
      pages.forEach(page => {
        drafts.push({
          name: `${page.title.rendered || '(No Title)'} [Page]`,
          url: siteUrl,
          wordpress_id: page.id,
          live_status: page.status,
          internal_status: 'To Do'
        })
      })
    }

    return drafts
  } catch (error) {
    console.error('WordPress Fetch Error:', error)
    return []
  }
}

export function normalizeUrl(url) {
  if (!url) return ''
  return url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export function getDomain(url) {
  return normalizeUrl(url).split('/')[0]
}
