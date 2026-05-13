import { GamePanel } from './components/GamePanel';
import { LeaderboardPanel } from './components/LeaderboardPanel';
import { MetricsPanel } from './components/MetricsPanel';
import { ProcessPanel } from './components/ProcessPanel';
import { ProgressionPanel } from './components/ProgressionPanel';

export function App() {
  return (
    <>
      <h1>Dadcraft Dashboard</h1>
      <ProgressionPanel />
      <LeaderboardPanel />
      <MetricsPanel />
      <ProcessPanel name="mangosd" />
      <ProcessPanel name="realmd" />
      <GamePanel heading="Character count" endpoint="/api/db/characters/count" />
      <GamePanel heading="Online characters" endpoint="/api/db/characters/online" />
      <GamePanel heading="Total guilds" endpoint="/api/db/guilds" />
      <GamePanel heading="Active auctions" endpoint="/api/db/auctions" />
      <GamePanel heading="Open GM tickets" endpoint="/api/db/tickets" />
    </>
  )
}

export default App