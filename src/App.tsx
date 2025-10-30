import { useState, useEffect } from 'react';
import ForceGraph from './components/ForceGraph';
import type { NetworkData } from './types';
import './App.css';

const API_BASE_URL = 'http://localhost:8000/api/v1';

function App() {
  const [citationData, setCitationData] = useState<NetworkData | null>(null);
  const [collaborationData, setCollaborationData] = useState<NetworkData | null>(null);
  const [scalabilityText, setScalabilityText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch citation network
        const citationResponse = await fetch(`${API_BASE_URL}/network/citation`);
        if (!citationResponse.ok) {
          throw new Error(`Citation network: ${citationResponse.statusText}`);
        }
        const citationJson = await citationResponse.json();
        console.log('Citation network data:', citationJson);
        console.log('Citation communities:', citationJson.communities);
        console.log('Sample nodes:', citationJson.nodes.slice(0, 5));
        setCitationData(citationJson);

        // Fetch collaboration network
        const collaborationResponse = await fetch(`${API_BASE_URL}/network/collaboration`);
        if (!collaborationResponse.ok) {
          throw new Error(`Collaboration network: ${collaborationResponse.statusText}`);
        }
        const collaborationJson = await collaborationResponse.json();
        console.log('Collaboration network data:', collaborationJson);
        console.log('Collaboration communities:', collaborationJson.communities);
        console.log('Sample nodes:', collaborationJson.nodes.slice(0, 5));
        setCollaborationData(collaborationJson);

        // Fetch scalability solution
        const scalabilityResponse = await fetch(`${API_BASE_URL}/scalability-solution`);
        if (scalabilityResponse.ok) {
          const scalabilityJson = await scalabilityResponse.json();
          setScalabilityText(scalabilityJson.solution_paragraph);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '20px',
        background: '#1a1a1a',
        color: '#e0e0e0'
      }}>
        Loading network data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '40px',
        textAlign: 'center',
        background: '#1a1a1a',
        color: '#e0e0e0',
        minHeight: '100vh'
      }}>
        <h2 style={{ color: '#ff5252' }}>Error Loading Data</h2>
        <p>{error}</p>
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#b0b0b0' }}>
          Make sure the backend server is running at {API_BASE_URL}
        </p>
        <p style={{ fontSize: '14px', color: '#b0b0b0' }}>
          Run: <code>uv run python src/scripts/pre_cache.py</code> to cache data
        </p>
      </div>
    );
  }

  return (
    <div className="App">
      <main style={{ padding: '40px 20px' }}>
        {/* Citation Network */}
        {citationData && (
          <section style={{ maxWidth: '1400px', margin: '0 auto 60px auto' }}>
            <ForceGraph 
              data={citationData}
              title="Paper Citation Network"
              isCitation={true}
            />
          </section>
        )}

        {/* Collaboration Network */}
        {collaborationData && (
          <section style={{ maxWidth: '1400px', margin: '0 auto 60px auto' }}>
            <ForceGraph 
              data={collaborationData}
              title="Author Collaboration Network"
              isCitation={false}
            />
          </section>
        )}

        {/* Scalability Solution */}
        {scalabilityText && (
          <section style={{ 
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '20px',
            background: '#2a2a2a',
            borderLeft: '4px solid #667eea',
            borderRadius: '4px'
          }}>
            <h2 style={{ marginTop: 0, color: '#e0e0e0' }}>
              Scalability Solution
            </h2>
            <p style={{ 
              fontSize: '16px', 
              lineHeight: '1.6',
              color: '#b0b0b0',
              margin: 0 
            }}>
              {scalabilityText}
            </p>
          </section>
        )}
      </main>

      <footer style={{ 
        padding: '20px',
        textAlign: 'center',
        background: '#1a1a1a',
        borderTop: '1px solid #333',
        marginTop: '40px',
        color: '#888'
      }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          Data Source: SciSciNet Open Dataset | 
          Visualization: D3.js Force-Directed Layout | 
          Community Detection: Louvain Algorithm
        </p>
      </footer>
    </div>
  );
}

export default App;
