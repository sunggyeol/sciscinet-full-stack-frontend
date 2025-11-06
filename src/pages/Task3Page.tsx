import { useState, useEffect } from 'react';
import { Sliders, Calendar, Info, TrendingUp } from 'lucide-react';
import HierarchicalGraph from '../components/HierarchicalGraph';

interface HierarchicalGraphData {
  nodes: Array<{
    id: string;
    name: string;
    community: number;
    citation_count: number;
    degree: number;
    year: number;
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
  year_range: {
    start: number;
    end: number;
  };
}

interface Task3PageProps {
  apiBaseUrl: string;
}

const Task3Page = ({ apiBaseUrl }: Task3PageProps) => {
  const [hierarchicalData, setHierarchicalData] = useState<HierarchicalGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxNodesPerCommunity, setMaxNodesPerCommunity] = useState<number>(50);
  const [maxCommunities, setMaxCommunities] = useState<number>(50);
  const [startYear, setStartYear] = useState<number>(2018);
  const [endYear, setEndYear] = useState<number>(2022);

  // Fetch hierarchical data based on year range
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `${apiBaseUrl}/network/hierarchical-citation?year_start=${startYear}&year_end=${endYear}`
        );
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
  }, [apiBaseUrl, startYear, endYear]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '14px',
        color: 'var(--text-secondary)',
        gap: '10px'
      }}>
        <TrendingUp className="animate-spin" size={20} />
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
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} />
          Error Loading Data
        </h3>
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
          margin: '0 0 16px 0',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: '1.5'
        }}>
          Advanced radial layout with edge bundling technique for improved visual clarity and pattern recognition.
          Use the controls below to filter data by time period for better scalability.
        </p>
      </div>

      {/* Interactive Controls */}
      <div style={{
        marginBottom: '24px',
        padding: '20px',
        background: 'var(--surface)',
        borderRadius: '8px',
        border: '1px solid var(--border-light)',
        boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)',
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '15px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Sliders size={18} />
          Visualization Controls
        </h3>

        {/* Year Range Selector */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            Select Time Period
          </label>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '16px',
            maxWidth: '400px'
          }}>
            {/* Start Year Dropdown */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
              }}>
                Start Year
              </label>
              <select
                value={startYear}
                onChange={(e) => {
                  const newStart = Number(e.target.value);
                  setStartYear(newStart);
                  // Ensure end year is not before start year
                  if (endYear < newStart) {
                    setEndYear(newStart);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  borderRadius: '6px',
                  border: '2px solid var(--border-light)',
                  background: 'white',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {[2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* End Year Dropdown */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
              }}>
                End Year
              </label>
              <select
                value={endYear}
                onChange={(e) => {
                  const newEnd = Number(e.target.value);
                  setEndYear(newEnd);
                  // Ensure start year is not after end year
                  if (startYear > newEnd) {
                    setStartYear(newEnd);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  borderRadius: '6px',
                  border: '2px solid var(--border-light)',
                  background: 'white',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {[2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{
            marginTop: '10px',
            padding: '8px 12px',
            background: 'var(--background-secondary)',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Calendar size={14} />
            Selected range: <strong style={{ color: 'var(--text-primary)' }}>
              {startYear === endYear ? `${startYear}` : `${startYear}-${endYear}`}
            </strong> ({endYear - startYear + 1} year{endYear - startYear > 0 ? 's' : ''})
          </div>
        </div>

        {/* Node Limit Slider */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}>
            Max Nodes per Community: {maxNodesPerCommunity}
          </label>
          <input
            type="range"
            min="5"
            max="100"
            value={maxNodesPerCommunity}
            onChange={(e) => setMaxNodesPerCommunity(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            <span>5 (Small)</span>
            <span>100 (Large)</span>
          </div>
        </div>

        {/* Community Limit Slider */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}>
            Max Communities to Label: {maxCommunities}
          </label>
          <input
            type="range"
            min="5"
            max="100"
            value={maxCommunities}
            onChange={(e) => setMaxCommunities(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            <span>5 (Clean)</span>
            <span>100 (Detailed)</span>
          </div>
        </div>

        <div style={{ 
          marginTop: '16px',
          padding: '10px',
          background: 'var(--background-secondary)',
          borderRadius: '6px',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          <Info size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span><strong>Tip:</strong> Hover over nodes to highlight connections. Adjust sliders to control visualization density.</span>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hierarchicalData && (
        <div style={{
          marginBottom: '16px',
          padding: '12px 16px',
          background: 'var(--background-secondary)',
          borderRadius: '6px',
          border: '1px solid var(--border-light)',
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          fontSize: '13px',
        }}>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Time Period:</span>{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {startYear === endYear ? `${startYear}` : `${startYear}-${endYear}`}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Max Nodes/Community:</span>{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{maxNodesPerCommunity}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Max Labels:</span>{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{maxCommunities}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Backend Dataset:</span>{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {hierarchicalData.nodes.length} nodes, {hierarchicalData.links.length} links
            </strong>
          </div>
        </div>
      )}

      {/* Hierarchical Graph */}
      {hierarchicalData && (
        <div style={{ marginBottom: '24px' }}>
          <HierarchicalGraph 
            data={hierarchicalData}
            maxNodesPerCommunity={maxNodesPerCommunity}
            maxCommunityLabels={maxCommunities}
            width={1000} 
            height={1000} 
          />
        </div>
      )}
    </div>
  );
};

export default Task3Page;

