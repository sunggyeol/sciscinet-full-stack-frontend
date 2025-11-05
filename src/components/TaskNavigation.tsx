import { Share2, BarChart3, GitBranch } from 'lucide-react';

interface TaskNavigationProps {
  currentTask: 'T1' | 'T2' | 'T3';
  onTaskChange: (task: 'T1' | 'T2' | 'T3') => void;
}

const TaskNavigation = ({ currentTask, onTaskChange }: TaskNavigationProps) => {
  const tasks = [
    { id: 'T1' as const, label: 'Network Graphs', subtitle: 'Interactive visualizations', icon: Share2 },
    { id: 'T2' as const, label: 'Coordinated Views', subtitle: 'Linked dashboards', icon: BarChart3 },
    { id: 'T3' as const, label: 'Edge Bundling', subtitle: 'Hierarchical layout', icon: GitBranch }
  ];

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <style>{`
        .task-nav-button {
          padding: 16px 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          fontSize: 14px;
          font-weight: 500;
          transition: all 0.15s ease;
          position: relative;
          margin-bottom: -2px;
          white-space: nowrap;
        }
        
        .task-nav-button.active {
          border-bottom: 3px solid var(--accent-primary);
          color: var(--accent-primary);
        }
        
        .task-nav-button:not(.active) {
          border-bottom: 3px solid transparent;
          color: var(--text-secondary);
        }
        
        .task-nav-button:not(.active):hover {
          color: var(--text-primary);
          background: var(--background-tertiary);
        }
        
        .task-nav-button.active:hover {
          background: rgba(var(--accent-primary-rgb, 26, 115, 232), 0.08);
        }
        
        .task-nav-subtitle {
          font-size: 12px;
          font-weight: 400;
          margin-top: 2px;
          transition: opacity 0.15s ease;
        }
        
        .task-nav-button:not(.active) .task-nav-subtitle {
          opacity: 0.7;
        }
        
        .task-nav-button.active .task-nav-subtitle {
          opacity: 0.9;
        }
        
        .task-nav-button:not(.active):hover .task-nav-subtitle {
          opacity: 0.85;
        }
      `}</style>
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
          {tasks.map(task => {
            const Icon = task.icon;
            return (
              <button
                key={task.id}
                onClick={() => onTaskChange(task.id)}
                className={`task-nav-button ${currentTask === task.id ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span>{task.label}</span>
                    <span className="task-nav-subtitle">
                      {task.subtitle}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default TaskNavigation;

