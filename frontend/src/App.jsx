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
    <>
      <h1>Dadcraft Dashboard</h1>
      <ServerBanner />

      <br />
      
      <div>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            disabled={t.key === activeTab}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'progression'  && <ProgressionPanel />}
      {activeTab === 'search'       && <CharacterSearchPanel />}
      {activeTab === 'leaderboard'  && <LeaderboardPanel />}
      {activeTab === 'metrics'      && <MetricsPanel />}
    </>
  )
}

export default App