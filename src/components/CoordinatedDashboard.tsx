import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, MousePointer2, Lightbulb } from 'lucide-react';
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
        color: 'var(--text-secondary)',
        gap: '10px'
      }}>
        <Loader2 className="animate-spin" size={20} />
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
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} />
          Error Loading Dashboard
        </h3>
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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <MousePointer2 size={48} style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.5} />
            </div>
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
              margin: '0 auto',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              textAlign: 'left'
            }}>
              <Lightbulb size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
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

