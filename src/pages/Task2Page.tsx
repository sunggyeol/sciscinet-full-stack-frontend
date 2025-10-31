import CoordinatedDashboard from '../components/CoordinatedDashboard';

interface Task2PageProps {
  apiBaseUrl: string;
}

const Task2Page = ({ apiBaseUrl }: Task2PageProps) => {
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
          Coordinated Dashboard Views
        </h2>
        <p style={{ 
          margin: 0,
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: '1.5'
        }}>
          Interactive linked visualizations with filter-and-detail pattern. Click any year to filter patent citations.
        </p>
      </div>

      {/* Coordinated Dashboard */}
      <CoordinatedDashboard apiBaseUrl={apiBaseUrl} />

      {/* Technical Details */}
      <div style={{ 
        marginTop: '24px',
        padding: '20px 24px',
        background: 'var(--surface)',
        borderRadius: '8px',
        border: '1px solid var(--border-light)'
      }}>
        <h3 style={{ 
          color: 'var(--text-primary)', 
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: 500
        }}>
          Implementation Details
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          color: 'var(--text-secondary)',
          fontSize: '13px'
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
              Timeline View
            </h4>
            <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.6' }}>
              <li>Paper counts by publication year</li>
              <li>Trend line overlay</li>
              <li>Interactive year selection</li>
              <li>D3.js scales and axes</li>
            </ul>
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
              Histogram View
            </h4>
            <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.6' }}>
              <li>Patent citation distribution</li>
              <li>Dynamic filtering by year</li>
              <li>Statistical summary</li>
              <li>Histogram binning algorithm</li>
            </ul>
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
              Interaction Model
            </h4>
            <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.6' }}>
              <li>Click events trigger filtering</li>
              <li>Real-time view updates</li>
              <li>Visual selection feedback</li>
              <li>Smooth transitions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task2Page;

