import { logger } from '../utils/logger.js'

export interface GitHubInsight {
  username: string
  repos: {
    name: string
    description: string | null
    language: string | null
    stars: number
    updated_at: string
  }[]
  top_languages: string[]
  total_stars: number
}

export class ContributionService {
  /**
   * Extract GitHub username from URL
   */
  private extractGitHubUsername(url: string): string | null {
    try {
      const match = url.match(/github\.com\/([^/?#]+)/i)
      return match ? match[1] : null
    } catch {
      return null
    }
  }

  /**
   * Fetch GitHub contribution insights
   */
  async getGitHubInsights(url: string): Promise<GitHubInsight | null> {
    const username = this.extractGitHubUsername(url)
    if (!username) return null

    try {
      logger.info(`🔍 Fetching GitHub insights for: ${username}`)
      
      const token = process.env.GITHUB_TOKEN
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'OptioHire-Bot'
      }
      
      if (token) {
        headers['Authorization'] = `token ${token}`
      }

      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=15`, { headers })
      
      if (!response.ok) {
        if (response.status === 403) {
          logger.warn('⚠️ GitHub API rate limit exceeded or forbidden')
        } else {
          logger.error(`❌ GitHub API error: ${response.status} ${response.statusText}`)
        }
        return null
      }

      const repos: any[] = await response.json()
      
      if (!Array.isArray(repos)) return null

      const processedRepos = repos.map(repo => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        updated_at: repo.updated_at
      }))

      const languages = [...new Set(repos.map(r => r.language).filter(Boolean) as string[])]
      const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)

      return {
        username,
        repos: processedRepos,
        top_languages: languages,
        total_stars: totalStars
      }
    } catch (error) {
      logger.error('❌ Failed to fetch GitHub insights:', error)
      return null
    }
  }

  /**
   * Scans all links for contribution insights
   */
  async scanLinks(links: string[]): Promise<any[]> {
    const insights: any[] = []

    for (const link of links) {
      if (link.includes('github.com')) {
        const gh = await this.getGitHubInsights(link)
        if (gh) {
          insights.push({
            type: 'github',
            url: link,
            data: gh
          })
        }
      }
    }

    return insights
  }
}
