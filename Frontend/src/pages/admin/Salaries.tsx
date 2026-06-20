import { useEffect, useState } from 'react';
import { getSalaries } from '../../services/adminService';

const Salaries = () => {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSalaries = async () => {
      try {
        const response = await getSalaries();
        setData(response);
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || 'Failed to load salaries data');
      } finally {
        setLoading(false);
      }
    };

    fetchSalaries();
  }, []);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Salaries</h1>
      </header>
      
      <div className="data-card">
        {loading && <div className="loading">Loading salaries...</div>}
        {error && <div className="error">{error}</div>}
        
        {!loading && !error && (
          <div className="data-content">
            <p>Salaries data loaded successfully. Render your tables or lists here.</p>
            <pre style={{ marginTop: '1rem', background: '#f1f5f9', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Salaries;
