import React, { useState } from 'react';
import { CharacterSearchPanel } from './components/CharacterSearchPanel';
import { LeaderboardPanel } from './components/LeaderboardPanel';
import { MetricsPanel } from './components/MetricsPanel';
import { ProgressionPanel } from './components/ProgressionPanel';
import { ServerBanner } from './components/ServerBanner';

const TABS = [
  { key: 'progression',  label: 'Progression' },
  { key: 'search',       label: 'Character Search' },
  { key: 'leaderboard',  label: 'Leaderboard' },
  { key: 'metrics',      label: 'Metrics' },
]

export function App() {
    const [activeTab, setActiveTab] = useState('progression')

    return (
      <div className="app-outer">
        <div className="app-shell">
          <header className="app-header">
          <ServerBanner />
          </header>

          <div className="app-body">
            <main className="app-content">
              <div className="card-blur-wrapper">
                <div className="card p-3" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {activeTab === 'progression'  && <ProgressionPanel />}
                {activeTab === 'search'       && <CharacterSearchPanel />}
                {activeTab === 'leaderboard'  && <LeaderboardPanel />}
                {activeTab === 'metrics'      && <MetricsPanel />}
                </div>
              </div>
            </main>

            <nav className="app-tabs">
              {TABS.map(t => (
              <button
                key={t.key}
                className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
  )
}

export default App
