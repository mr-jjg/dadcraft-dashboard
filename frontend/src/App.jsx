import { MetricPanel } from './components/MetricPanel';
import { ProcessPanel } from './components/ProcessPanel';
import { GamePanel } from './components/GamePanel';

export function App() {
  return (
    <>
      <h1>Dadcraft Dashboard</h1>
      <MetricPanel label="CPU usage" endpoint="/api/cpu" unit="%" precision={1} />
      <MetricPanel label="Memory usage" endpoint="/api/memory" unit="%" precision={1} />
      <MetricPanel label="Swap usage" endpoint="/api/swap" unit="%" precision={1} />
      <MetricPanel label="Disk usage" endpoint="/api/disk" unit="%" precision={1} />
      <MetricPanel label="I/O wait" endpoint="/api/io" unit="%" precision={1} />
      <MetricPanel label="Load (1m)" endpoint="/api/load1" unit="" precision={1} />
      <MetricPanel label="Load (5m)" endpoint="/api/load5" unit="" precision={1} />
      <MetricPanel label="Load (15m)" endpoint="/api/load15" unit="" precision={1} />
      <MetricPanel label="Network in" endpoint="/api/rx" unit=" B/s" />
      <MetricPanel label="Network out" endpoint="/api/tx" unit=" B/s" />
      <ProcessPanel name="mangosd" />
      <ProcessPanel name="realmd" />
      <ProcessPanel name="mysqld" />
      <GamePanel heading="Character count" endpoint="/api/db/characters/count" />
      <GamePanel heading="Online characters" endpoint="/api/db/characters/online" />
      <GamePanel heading="Total guilds" endpoint="/api/db/guilds" />
      <GamePanel heading="Active auctions" endpoint="/api/db/auctions" />
      <GamePanel heading="Open GM tickets" endpoint="/api/db/tickets" />
      <GamePanel heading="Race" endpoint="/api/db/characters/race" />
      <GamePanel heading="Class" endpoint="/api/db/characters/class" />
      <GamePanel heading="Level" endpoint="/api/db/characters/level" />
      <GamePanel heading="Name/Level/Class" endpoint="/api/db/characters/namelevelclass" />
    </>
  )
}

export default App