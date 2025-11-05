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
    </div>
  );
};

export default Task2Page;

