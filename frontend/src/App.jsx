import { GamePanel } from './components/GamePanel';
import { LeaderboardPanel } from './components/LeaderboardPanel';
import { MetricsPanel } from './components/MetricsPanel';
import { ProcessPanel } from './components/ProcessPanel';
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
      <ProcessPanel name="mangosd" />
      <ProcessPanel name="realmd" />
    </>
  )
}

export default App