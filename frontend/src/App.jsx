import { MetricPanel } from './components/MetricPanel';
import { ProcessPanel } from './components/ProcessPanel';

export function App() {
  return (
    <>
      <h1>Dadcraft Dashboard</h1>
      <MetricPanel label="CPU usage" endpoint="/api/cpu" unit="%" />
      <MetricPanel label="Memory usage" endpoint="/api/memory" unit="%" />
      <MetricPanel label="Swap usage" endpoint="/api/swap" unit="%" />
      <MetricPanel label="Disk usage" endpoint="/api/disk" unit="%" />
      <MetricPanel label="I/O wait" endpoint="/api/io" unit="%" />
      <MetricPanel label="Load (1m)" endpoint="/api/load1" unit="" />
      <MetricPanel label="Load (5m)" endpoint="/api/load5" unit="" />
      <MetricPanel label="Load (15m)" endpoint="/api/load15" unit="" />
      <MetricPanel label="Network in" endpoint="/api/rx" unit=" B/s" />
      <MetricPanel label="Network out" endpoint="/api/tx" unit=" B/s" />
      <ProcessPanel name="mangosd" />
      <ProcessPanel name="realmd" />
      <ProcessPanel name="mysqld" />
    </>
  )
}

export default App