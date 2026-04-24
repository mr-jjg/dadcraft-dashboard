import { useState, useEffect } from 'react';
import { MetricPanel } from './components/MetricPanel';


export function App() {
  const [health, setHealth] = useState('Loading...');

  useEffect(() => {
      const fetchHealth = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/health`);
          if (!response.ok) {
            throw new Error(`${response.status}`)
          };
          setHealth(await response.text());
        } catch (error) {
          setHealth(`Response status: ${error.message}`);
        }
      }
      fetchHealth();
    }, []);
    
  return (
    <>
      <h1>Dadcraft Dashboard</h1>
      <p>{health}</p>
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
      <MetricPanel label="mangosd CPU" endpoint="/api/mangosd/cpu" unit="%" />
      <MetricPanel label="mangosd memory" endpoint="/api/mangosd/memory" unit=" MB" />
      <MetricPanel label="mangosd procs" endpoint="/api/mangosd/procs" unit="" />
      <MetricPanel label="realmd CPU" endpoint="/api/realmd/cpu" unit="%" />
      <MetricPanel label="realmd memory" endpoint="/api/realmd/memory" unit=" MB" />
      <MetricPanel label="realmd procs" endpoint="/api/realmd/procs" unit="" />
      <MetricPanel label="mysqld CPU" endpoint="/api/mysqld/cpu" unit="%" />
      <MetricPanel label="mysqld memory" endpoint="/api/mysqld/memory" unit=" MB" />
      <MetricPanel label="mysqld procs" endpoint="/api/mysqld/procs" unit="" />
    </>
  )
}

export default App