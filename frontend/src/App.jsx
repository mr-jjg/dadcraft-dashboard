import { MetricPanel } from './components/MetricPanel';
import { ProcessPanel } from './components/ProcessPanel';
import { DistributionPanel } from './components/DistributionPanel';

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
      <MetricPanel label="Character count" endpoint="/api/db/characters/count" unit="" />
      <MetricPanel label="Online characters" endpoint="/api/db/characters/online" unit="" />
      <MetricPanel label="Total guilds" endpoint="/api/db/guilds" unit="" />
      <MetricPanel label="Active auctions" endpoint="/api/db/auctions" unit="" />
      <MetricPanel label="Open GM tickets" endpoint="/api/db/tickets" unit="" />
      <DistributionPanel heading="Race" endpoint="/api/db/characters/race" />
      <DistributionPanel heading="Class" endpoint="/api/db/characters/class" />
    </>
  )
}

export default App