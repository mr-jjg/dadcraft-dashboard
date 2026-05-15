import { LeaderboardPanel } from './components/LeaderboardPanel';
import { MetricsPanel } from './components/MetricsPanel';
import { ProgressionPanel } from './components/ProgressionPanel';
import { ServerBanner } from './components/ServerBanner';

export function App() {
  return (
    <>
      <h1>Dadcraft Dashboard</h1>
      <ServerBanner />
      <ProgressionPanel />
      <LeaderboardPanel />
      <MetricsPanel />
    </>
  )
}

export default App