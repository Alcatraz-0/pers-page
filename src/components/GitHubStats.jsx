import { useEffect, useState } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function GitHubStats() {
  const [ref, visible] = useScrollReveal()
  const [stats, setStats] = useState(null)
  const [repos, setRepos] = useState([])
  const [err, setErr] = useState(false)

  useEffect(() => {
    if (!visible || stats) return
    Promise.all([
      fetch('https://api.github.com/users/Alcatraz-0').then(r => r.json()),
      fetch('https://api.github.com/users/Alcatraz-0/repos?per_page=100').then(r => r.json()),
    ]).then(([user, repoList]) => {
      if (user.message) { setErr(true); return }
      const totalStars = Array.isArray(repoList)
        ? repoList.reduce((s, r) => s + (r.stargazers_count || 0), 0)
        : 0
      // Count language usage
      const langCount = {}
      if (Array.isArray(repoList)) {
        repoList.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1 })
      }
      const topLang = Object.entries(langCount).sort((a,b) => b[1]-a[1])[0]?.[0] || 'N/A'
      setStats({ repos: user.public_repos, followers: user.followers, stars: totalStars, topLang })
      setRepos(Array.isArray(repoList)
        ? repoList.sort((a,b) => (b.stargazers_count||0)-(a.stargazers_count||0)).slice(0, 3)
        : [])
    }).catch(() => setErr(true))
  }, [visible, stats])

  return (
    <div ref={ref} className={`github-stats section-reveal${visible ? ' visible' : ''}`}>
      <p className="section-label">// GITHUB ACTIVITY</p>
      <div className="gh-cards">
        {err ? (
          <p className="gh-err">[ API RATE LIMITED — CHECK BACK LATER ]</p>
        ) : !stats ? (
          <p className="gh-loading">LOADING...</p>
        ) : (
          <>
            {[
              { v: stats.repos,     l: 'REPOS' },
              { v: stats.stars,     l: 'STARS' },
              { v: stats.followers, l: 'FOLLOWERS' },
              { v: stats.topLang,   l: 'TOP LANG' },
            ].map(({ v, l }) => (
              <div key={l} className="gh-stat-card">
                <span className="gh-stat-value">{v}</span>
                <span className="gh-stat-label">{l}</span>
              </div>
            ))}
          </>
        )}
      </div>
      {repos.length > 0 && (
        <div className="gh-repos">
          {repos.map(r => (
            <a
              key={r.id}
              href={r.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="gh-repo-card"
            >
              <span className="gh-repo-name">{r.name.toUpperCase()}</span>
              <span className="gh-repo-lang">{r.language || 'N/A'}</span>
              <span className="gh-repo-stars">★ {r.stargazers_count}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
