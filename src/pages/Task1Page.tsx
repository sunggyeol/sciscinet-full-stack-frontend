import { useState, useEffect } from 'react';
import ForceGraph from '../components/ForceGraph';
import type { NetworkData } from '../types';

interface Task1PageProps {
  apiBaseUrl: string;
}

const Task1Page = ({ apiBaseUrl }: Task1PageProps) => {
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
        const citationResponse = await fetch(`${apiBaseUrl}/network/citation`);
        if (!citationResponse.ok) {
          throw new Error(`Citation network: ${citationResponse.statusText}`);
        }
        const citationJson = await citationResponse.json();
        setCitationData(citationJson);

        // Fetch collaboration network
        const collaborationResponse = await fetch(`${apiBaseUrl}/network/collaboration`);
        if (!collaborationResponse.ok) {
          throw new Error(`Collaboration network: ${collaborationResponse.statusText}`);
        }
        const collaborationJson = await collaborationResponse.json();
        setCollaborationData(collaborationJson);

        // Fetch scalability solution
        const scalabilityResponse = await fetch(`${apiBaseUrl}/scalability-solution`);
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
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '14px',
        color: 'var(--text-secondary)'
      }}>
        Loading visualizations...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '24px',
        background: 'var(--error-light)',
        border: '1px solid var(--error)',
        borderRadius: '8px',
        color: 'var(--error)'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 500 }}>Error Loading Data</h3>
        <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
        <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Make sure the backend server is running and data is cached
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          margin: '0 0 8px 0',
          fontSize: '20px',
          fontWeight: 500,
          color: 'var(--text-primary)'
        }}>
          Interactive Network Visualizations
        </h2>
        <p style={{ 
          margin: 0,
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: '1.5'
        }}>
          Force-directed network graphs showing paper citations and author collaborations with community detection.
        </p>
      </div>

      {/* Citation Network */}
      {citationData && (
        <div style={{ marginBottom: '24px' }}>
          <ForceGraph 
            data={citationData}
            title="Paper Citation Network"
            isCitation={true}
          />
        </div>
      )}

      {/* Collaboration Network */}
      {collaborationData && (
        <div style={{ marginBottom: '24px' }}>
          <ForceGraph 
            data={collaborationData}
            title="Author Collaboration Network"
            isCitation={false}
          />
        </div>
      )}

      {/* Scalability Solution */}
      {scalabilityText && (
        <section style={{ 
          padding: '24px',
          background: 'var(--surface)',
          borderRadius: '4px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
          marginTop: '32px',
          border: '1px solid var(--border-light)'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            color: 'var(--text-primary)', 
            fontSize: '16px',
            fontWeight: 500,
            letterSpacing: '0.25px'
          }}>
            Scalability Solution
          </h3>
          <p style={{ 
            fontSize: '14px', 
            lineHeight: '1.6',
            color: 'var(--text-secondary)',
            margin: 0,
            fontWeight: 400
          }}>
            {scalabilityText}
          </p>
        </section>
      )}
    </div>
  );
};

export default Task1Page;

