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
      <MetricPanel label="CPU" endpoint="/api/cpu" unit="%" />
    </>
  )
}

export default App