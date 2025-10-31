import { useState, useEffect } from 'react';
import Timeline from './Timeline';
import Histogram from './Histogram';

interface TimelineData {
  year: number;
  count: number;
}

interface CoordinatedDashboardProps {
  apiBaseUrl: string;
}

const CoordinatedDashboard = ({ apiBaseUrl }: CoordinatedDashboardProps) => {
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [patentData, setPatentData] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch timeline data on mount
  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/timeline/papers-by-year`);
        if (!response.ok) {
          throw new Error(`Failed to fetch timeline: ${response.statusText}`);
        }
        const data = await response.json();
        setTimelineData(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch timeline data');
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [apiBaseUrl]);

  // Fetch patent data when a year is selected
  const handleYearClick = async (year: number) => {
    try {
      setSelectedYear(year);
      const response = await fetch(`${apiBaseUrl}/data/patents-by-year?year=${year}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch patent data: ${response.statusText}`);
      }
      const data = await response.json();
      setPatentData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patent data');
      setPatentData([]);
    }
  };

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
        Loading dashboard...
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
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 500 }}>Error Loading Dashboard</h3>
        <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Dashboard 1: Timeline */}
      <div style={{ marginBottom: '24px' }}>
        <Timeline 
          data={timelineData}
          width={900}
          height={450}
          onYearClick={handleYearClick}
          selectedYear={selectedYear}
        />
      </div>

      {/* Dashboard 2: Histogram */}
      <div>
        {patentData.length > 0 ? (
          <Histogram 
            data={patentData}
            selectedYear={selectedYear}
            width={900}
            height={450}
          />
        ) : (
          <div style={{ 
            textAlign: 'center',
            padding: '80px 24px',
            background: 'var(--surface)',
            borderRadius: '8px',
            border: '1px solid var(--border-light)'
          }}>
            <h3 style={{ 
              color: 'var(--text-primary)', 
              marginBottom: '12px',
              fontSize: '16px',
              fontWeight: 500
            }}>
              No Year Selected
            </h3>
            <p style={{ 
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '20px'
            }}>
              Click on any year in the timeline above to view the patent citation distribution.
            </p>
            <div style={{ 
              padding: '16px',
              background: 'var(--accent-light)',
              borderRadius: '8px',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <p style={{ 
                margin: 0, 
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6'
              }}>
                <strong style={{ color: 'var(--accent-primary)' }}>Interaction Guide:</strong> The histogram will dynamically update 
                to show only papers from the selected year, demonstrating a filter-and-detail pattern.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoordinatedDashboard;

