import { useState } from 'react';
import TaskNavigation from './components/TaskNavigation';
import Task1Page from './pages/Task1Page';
import Task2Page from './pages/Task2Page';
import Task3Page from './pages/Task3Page';
import './App.css';

const API_BASE_URL = 'http://localhost:8000/api/v1';

function App() {
  const [currentTask, setCurrentTask] = useState<'T1' | 'T2' | 'T3'>('T1');

  return (
    <div className="App">
      {/* Header */}
      <header style={{
        background: 'var(--surface)',
        padding: '20px 24px',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ 
            margin: 0,
            fontSize: '22px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            letterSpacing: '-0.5px'
          }}>
            SciSciNet Network Analysis
          </h1>
          <p style={{ 
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            fontWeight: 400
          }}>
            Virginia Tech CS Research Publications
          </p>
        </div>
      </header>

      {/* Navigation */}
      <TaskNavigation 
        currentTask={currentTask} 
        onTaskChange={setCurrentTask}
      />

      {/* Main Content */}
      <main style={{ 
        padding: '24px', 
        maxWidth: '1400px', 
        margin: '0 auto',
        minHeight: 'calc(100vh - 240px)'
      }}>
        {currentTask === 'T1' && <Task1Page apiBaseUrl={API_BASE_URL} />}
        {currentTask === 'T2' && <Task2Page apiBaseUrl={API_BASE_URL} />}
        {currentTask === 'T3' && <Task3Page apiBaseUrl={API_BASE_URL} />}
      </main>

      {/* Footer */}
      <footer style={{ 
        padding: '24px',
        textAlign: 'center',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border-light)',
        marginTop: '48px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '24px',
            flexWrap: 'wrap',
            fontSize: '13px',
            color: 'var(--text-tertiary)'
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>Data Source: SciSciNet Open Dataset</span>
            <span>•</span>
            <span>Visualization: D3.js</span>
            <span>•</span>
            <span>Community Detection: Louvain Algorithm</span>
          </div>
          <div style={{ 
            marginTop: '12px',
            fontSize: '12px',
            color: 'var(--text-tertiary)'
          }}>
            Virginia Tech Computer Science Department
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
