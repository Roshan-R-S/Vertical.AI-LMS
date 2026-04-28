import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function DebugPage() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const endpoints = [
    '/users',
    '/leads', 
    '/clients',
    '/milestones',
    '/dispositions',
    '/teams',
    '/tasks',
    '/invoices',
    '/notifications',
    '/settings',
    '/attachments',
    '/interactions',
    '/sources'
  ];

  const testEndpoint = async (endpoint) => {
    try {
      console.log(`Testing ${endpoint}...`);
      const result = await api.get(endpoint);
      setResults(prev => ({
        ...prev,
        [endpoint]: {
          status: 'success',
          data: result,
          count: Array.isArray(result) ? result.length : 'object'
        }
      }));
    } catch (error) {
      console.error(`Error testing ${endpoint}:`, error);
      setResults(prev => ({
        ...prev,
        [endpoint]: {
          status: 'error',
          error: error.message,
          statusCode: error.status
        }
      }));
    }
  };

  const testAllEndpoints = async () => {
    setLoading(true);
    setResults({});
    
    for (const endpoint of endpoints) {
      await testEndpoint(endpoint);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    testAllEndpoints();
  }, []);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">API Debug</h1>
          <p className="page-subtitle">Test all API endpoints</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={testAllEndpoints}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test All Endpoints'}
        </button>
      </div>

      <div className="grid gap-4">
        {endpoints.map(endpoint => {
          const result = results[endpoint];
          
          return (
            <div key={endpoint} className="studio-card p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{endpoint}</h3>
                <div className="flex gap-2">
                  {result ? (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      result.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.status}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      pending
                    </span>
                  )}
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => testEndpoint(endpoint)}
                  >
                    Test
                  </button>
                </div>
              </div>
              
              {result && (
                <div className="text-sm">
                  {result.status === 'success' ? (
                    <div>
                      <p className="text-green-600 mb-1">
                        ✅ Success - {result.count} {typeof result.count === 'number' ? 'items' : ''}
                      </p>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600">View Data</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <div>
                      <p className="text-red-600 mb-1">
                        ❌ Error {result.statusCode}: {result.error}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}