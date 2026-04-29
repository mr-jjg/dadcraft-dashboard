import { MetricPanel } from './components/MetricPanel';
import { ProcessPanel } from './components/ProcessPanel';

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
      <MetricPanel label="Character Count" endpoint="/api/db/characters/count" unit="" />
    </>
  )
}

export default App