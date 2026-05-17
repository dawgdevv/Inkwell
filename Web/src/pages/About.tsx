import { useState, useEffect } from 'react'
import { Feather, Heart, GitBranch } from 'lucide-react'
import { api } from '../api/client'
import './About.css'

export default function About() {
  const [aboutData, setAboutData] = useState<{
    name: string
    email: string
    'my features': Record<string, string>
  } | null>(null)

  useEffect(() => {
    api.about().then(setAboutData).catch(() => {})
  }, [])

  return (
    <div className="about-page">
      <div className="about-header">
        <Feather className="about-logo" size={40} />
        <h1>Inkwell Notes</h1>
        <p className="about-tagline">
          A thoughtful space for your ideas, built with care
        </p>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <h3>About the Creator</h3>
          {aboutData ? (
            <div className="about-creator">
              <p className="creator-name">{aboutData.name}</p>
              <p className="creator-email">{aboutData.email}</p>
            </div>
          ) : (
            <p className="about-placeholder">Loading...</p>
          )}
        </div>

        <div className="about-card about-card--featured">
          <div className="about-card-icon">
            <GitBranch size={24} />
          </div>
          <h3>Custom Feature</h3>
          {aboutData ? (
            Object.entries(aboutData['my features']).map(([name, description]) => (
              <div key={name} className="feature-block">
                <h4>{name}</h4>
                <p>{description}</p>
              </div>
            ))
          ) : (
            <p className="about-placeholder">Loading...</p>
          )}
        </div>

        <div className="about-card">
          <h3>Technology</h3>
          <ul className="tech-list">
            <li>Go + Gin backend</li>
            <li>React + Vite frontend</li>
            <li>GORM + PostgreSQL (Neon)</li>
            <li>JWT authentication</li>
            <li>Version history tracking</li>
          </ul>
        </div>
      </div>

      <div className="about-footer">
        <Heart size={14} className="heart-icon" />
        <p>Built with passion and attention to detail</p>
      </div>
    </div>
  )
}
