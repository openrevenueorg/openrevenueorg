import React, { useEffect, useState } from 'react';

interface APIKey {
  id: string;
  name: string;
  expiresAt?: string;
  createdAt: string;
}

export default function APIKeys() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState<{ key: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    expiresIn: 90,
  });

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/v1/api-keys');
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setNewKey({ key: data.apiKey.key });
        setFormData({ name: '', expiresIn: 90 });
        fetchKeys();
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

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;

    try {
      await fetch(`/api/v1/api-keys/${id}`, {
        method: 'DELETE',
      });
      fetchKeys();
    } catch (err) {
      console.error('Failed to revoke API key:', err);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage API keys for accessing your standalone app.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setNewKey(null);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Create API Key'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white shadow sm:rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Key Name</label>
                <input
                  title="Key Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="e.g., Production API Key"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expires In (days)</label>
                <input
                  title="Expires In (days)"
                  type="number"
                  value={formData.expiresIn}
                  onChange={(e) => setFormData({ ...formData, expiresIn: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  min="1"
                  max="365"
                  required
                />
              </div>
              <button
                title="Create API Key"
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create API Key'}
              </button>
            </div>
          </form>
        </div>
      )}

      {newKey && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-green-800 mb-2">API Key Created!</h3>
          <p className="text-sm text-green-700 mb-3">
            Copy this key now. You won't be able to see it again.
          </p>
          <div className="flex gap-2">
            <input
              title="API Key"
              placeholder="Enter your API key"
              type="text"
              value={newKey.key}
              readOnly
              className="flex-1 rounded-md border-green-300 bg-white shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border font-mono text-xs"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(newKey.key);
                alert('API key copied to clipboard!');
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {keys.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500">
              No API keys yet. Create your first API key to get started.
            </li>
          ) : (
            keys.map((key) => (
              <li key={key.id}>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{key.name}</p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(key.createdAt).toLocaleDateString()}
                      {key.expiresAt && ` • Expires: ${new Date(key.expiresAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevoke(key.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Revoke
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
