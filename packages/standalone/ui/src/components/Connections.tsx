import React, { useEffect, useState } from 'react';

interface Connection {
  id: string;
  provider: string;
  isActive: boolean;
  lastSyncedAt?: string;
  createdAt: string;
}

export default function Connections() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    provider: 'stripe',
    apiKey: '',
  });

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/v1/connections');
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections || []);
      }
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/v1/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({ provider: 'stripe', apiKey: '' });
        fetchConnections();
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this connection?')) return;

    try {
      await fetch(`/api/v1/connections/${id}`, {
        method: 'DELETE',
      });
      fetchConnections();
    } catch (err) {
      console.error('Failed to delete connection:', err);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Connections</h2>
          <p className="mt-1 text-sm text-gray-600">
            Connect your payment processors to sync revenue data.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Add Connection'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white shadow sm:rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Provider</label>
                <select
                  title="Provider"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="stripe">Stripe</option>
                  <option value="polar">Polar.sh</option>
                  <option value="paddle">Paddle</option>
                  <option value="lemonsqueezy">Lemon Squeezy (coming soon)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">API Key</label>
                <input
                  title="API Key"
                  placeholder="Enter your API key"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  required
                />
              </div>
              <button
                title="Add Connection"
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Connection'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {connections.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500">
              No connections yet. Add your first payment provider connection.
            </li>
          ) : (
            connections.map((conn) => (
              <li key={conn.id}>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${conn.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <span className="text-sm font-medium text-gray-700 uppercase">
                          {conn.provider[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 capitalize">{conn.provider}</p>
                      <p className="text-sm text-gray-500">
                        {conn.lastSyncedAt
                          ? `Last synced: ${new Date(conn.lastSyncedAt).toLocaleString()}`
                          : 'Never synced'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${conn.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {conn.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleDelete(conn.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
