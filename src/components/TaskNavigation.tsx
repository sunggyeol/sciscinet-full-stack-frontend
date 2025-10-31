interface TaskNavigationProps {
  currentTask: 'T1' | 'T2' | 'T3';
  onTaskChange: (task: 'T1' | 'T2' | 'T3') => void;
}

const TaskNavigation = ({ currentTask, onTaskChange }: TaskNavigationProps) => {
  const tasks = [
    { id: 'T1' as const, label: 'Network Graphs', subtitle: 'Interactive visualizations' },
    { id: 'T2' as const, label: 'Coordinated Views', subtitle: 'Linked dashboards' },
    { id: 'T3' as const, label: 'Edge Bundling', subtitle: 'Hierarchical layout' }
  ];

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        padding: '0 24px'
      }}>
        <div style={{ 
        display: 'flex',
          gap: '0',
          borderBottom: '2px solid var(--border-light)'
      }}>
        {tasks.map(task => (
          <button
            key={task.id}
            onClick={() => onTaskChange(task.id)}
            style={{
                padding: '16px 24px',
                background: 'transparent',
                border: 'none',
                borderBottom: currentTask === task.id 
                  ? '3px solid var(--accent-primary)'
                  : '3px solid transparent',
                color: currentTask === task.id 
                  ? 'var(--accent-primary)'
                  : 'var(--text-secondary)',
              cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              position: 'relative',
                marginBottom: '-2px',
                whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (currentTask !== task.id) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'var(--background-tertiary)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentTask !== task.id) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
              }
            }}
          >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span>{task.label}</span>
                <span style={{ 
              fontSize: '12px', 
                  fontWeight: 400,
                  opacity: 0.8,
                  marginTop: '2px'
            }}>
              {task.subtitle}
                </span>
            </div>
          </button>
        ))}
      </div>
      </div>
    </nav>
  );
};

export default TaskNavigation;

