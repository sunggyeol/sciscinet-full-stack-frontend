import { useState, useEffect } from 'react';
import HierarchicalGraph from '../components/HierarchicalGraph';

interface HierarchicalGraphData {
  nodes: Array<{
    id: string;
    name: string;
    community: number;
    citation_count: number;
    degree: number;
  }>;
  links: Array<{
    source: string;
    target: string;
    source_community: number;
    target_community: number;
  }>;
  communities: Array<{
    id: number;
    size: number;
    nodes: string[];
  }>;
  total_communities: number;
}

interface Task3PageProps {
  apiBaseUrl: string;
}

const Task3Page = ({ apiBaseUrl }: Task3PageProps) => {
  const [hierarchicalData, setHierarchicalData] = useState<HierarchicalGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`${apiBaseUrl}/network/hierarchical-citation`);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data = await response.json();
        setHierarchicalData(data);
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
        Loading visualization...
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
          Hierarchical Edge Bundling
        </h2>
        <p style={{ 
          margin: '0 0 12px 0',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: '1.5'
        }}>
          Advanced radial layout with edge bundling technique for improved visual clarity and pattern recognition.
        </p>
        <div style={{ 
          display: 'inline-block',
          padding: '8px 16px',
          background: 'var(--accent-light)',
          borderRadius: '8px',
          fontSize: '13px',
          color: 'var(--accent-primary)',
          fontWeight: 500
        }}>
          Hover over nodes to highlight connections
        </div>
      </div>

      {/* Hierarchical Graph */}
      {hierarchicalData && (
        <div style={{ marginBottom: '24px' }}>
          <HierarchicalGraph 
            data={hierarchicalData} 
            width={1000} 
            height={1000} 
          />
        </div>
      )}

      {/* Comparison Card */}
      <div style={{ 
        padding: '24px',
        background: 'var(--surface)',
        borderRadius: '8px',
        border: '1px solid var(--border-light)'
      }}>
        <h3 style={{ 
          color: 'var(--text-primary)', 
          margin: '0 0 20px 0', 
          fontSize: '16px',
          fontWeight: 500
        }}>
          Improvements Over Force-Directed Layout
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          <div style={{ 
            padding: '16px',
            background: 'var(--background-secondary)',
            borderRadius: '8px',
            border: '1px solid var(--border-light)'
          }}>
            <h4 style={{ 
              color: 'var(--text-primary)', 
              margin: '0 0 8px 0',
              fontSize: '14px',
              fontWeight: 500
            }}>
              Edge Bundling
            </h4>
            <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, color: 'var(--text-secondary)' }}>
              <strong>Before:</strong> Individual straight lines create visual clutter
              <br/><br/>
              <strong>After:</strong> Related edges bundle together, reducing overlap and revealing connection patterns. 
              Inter-community links route through center.
            </p>
          </div>

          <div style={{ 
            padding: '16px',
            background: 'var(--background-secondary)',
            borderRadius: '8px',
            border: '1px solid var(--border-light)'
          }}>
            <h4 style={{ 
              color: 'var(--text-primary)', 
              margin: '0 0 8px 0',
              fontSize: '14px',
              fontWeight: 500
            }}>
              Radial Layout
            </h4>
            <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, color: 'var(--text-secondary)' }}>
              <strong>Before:</strong> Force-directed with unpredictable node positions
              <br/><br/>
              <strong>After:</strong> Circular arrangement with community grouping provides 
              consistent structure and optimal space utilization.
            </p>
          </div>

          <div style={{ 
            padding: '16px',
            background: 'var(--background-secondary)',
            borderRadius: '8px',
            border: '1px solid var(--border-light)'
          }}>
            <h4 style={{ 
              color: 'var(--text-primary)', 
              margin: '0 0 8px 0',
              fontSize: '14px',
              fontWeight: 500
            }}>
              Community Display
            </h4>
            <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, color: 'var(--text-secondary)' }}>
              <strong>Before:</strong> Communities shown only by node colors
              <br/><br/>
              <strong>After:</strong> Colored arcs explicitly mark boundaries. 
              Labels provide clear identification. Spatial grouping enhances cluster visibility.
            </p>
          </div>
        </div>

        <div style={{ 
          marginTop: '20px',
          padding: '16px',
          background: 'var(--background-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--border-light)'
        }}>
          <h4 style={{ 
            color: 'var(--text-primary)', 
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: 500
          }}>
            Enhanced Readability
          </h4>
          <p style={{ 
            color: 'var(--text-secondary)', 
            margin: 0, 
            fontSize: '13px',
            lineHeight: '1.6'
          }}>
            The combination of edge bundling and radial layout enables easier identification of communities,
            connection tracing, network structure analysis, and pattern recognition.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Task3Page;

