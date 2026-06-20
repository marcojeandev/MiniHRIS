import { useEffect, useState } from 'react';
import { getEmployees } from '../../services/adminService';

const Employees = () => {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getEmployees();
        setData(response);
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || 'Failed to load employees data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Employees</h1>
      </header>

      <div className="data-card">
        {loading && <div className="loading">Loading employees...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <div className="data-content">
            <p>Employees data loaded successfully. Render your tables or lists here.</p>
            <pre style={{ marginTop: '1rem', background: '#f1f5f9', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;
