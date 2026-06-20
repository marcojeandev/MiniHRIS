import { useEffect, useState } from 'react';
import { getAttendance } from '../../services/adminService';

const Attendance = () => {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await getAttendance();
        setData(response);
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || 'Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Attendance</h1>
      </header>
      
      <div className="data-card">
        {loading && <div className="loading">Loading attendance...</div>}
        {error && <div className="error">{error}</div>}
        
        {!loading && !error && (
          <div className="data-content">
            <p>Attendance data loaded successfully. Render your tables or lists here.</p>
            <pre style={{ marginTop: '1rem', background: '#f1f5f9', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
