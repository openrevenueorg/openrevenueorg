import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Startup details
  const [startupData, setStartupData] = useState({
    startup_name: '',
    startup_tagline: '',
    startup_description: '',
    startup_website: '',
    founder_name: '',
    founder_email: '',
  });

  // Step 2: Admin account
  const [adminData, setAdminData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
  });

  async function handleStartupSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/v1/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(startupData),
      });

      if (!response.ok) {
        throw new Error('Failed to save startup details');
      }

      setStep(2);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (adminData.password !== adminData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (adminData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Register admin user
      const registerResponse = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: adminData.username,
          password: adminData.password,
          email: adminData.email || undefined,
        }),
      });

      if (!registerResponse.ok) {
        const error = await registerResponse.json();
        throw new Error(error.error || 'Failed to create admin account');
      }

      // Complete onboarding
      const onboardingResponse = await fetch('/api/v1/settings/complete-onboarding', {
        method: 'POST',
        credentials: 'include',
      });

      if (!onboardingResponse.ok) {
        throw new Error('Failed to complete onboarding');
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to OpenRevenue
          </h1>
          <p className="text-gray-600">
            Let's set up your revenue transparency platform
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'}`}>
                  1
                </div>
                <span className="ml-2 font-medium">Startup Details</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'}`}>
                  2
                </div>
                <span className="ml-2 font-medium">Admin Account</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStartupSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Startup Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={startupData.startup_name}
                    onChange={(e) =>
                      setStartupData({ ...startupData, startup_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="My Awesome Startup"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={startupData.startup_tagline}
                    onChange={(e) =>
                      setStartupData({ ...startupData, startup_tagline: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Building the future of..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={startupData.startup_description}
                    onChange={(e) =>
                      setStartupData({ ...startupData, startup_description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Tell the world about your startup..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={startupData.startup_website}
                    onChange={(e) =>
                      setStartupData({ ...startupData, startup_website: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Founder Name
                  </label>
                  <input
                    type="text"
                    value={startupData.founder_name}
                    onChange={(e) =>
                      setStartupData({ ...startupData, founder_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Founder Email
                  </label>
                  <input
                    type="email"
                    value={startupData.founder_email}
                    onChange={(e) =>
                      setStartupData({ ...startupData, founder_email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="founder@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                Continue
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleAdminSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminData.username}
                    onChange={(e) =>
                      setAdminData({ ...adminData, username: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="admin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={adminData.email}
                    onChange={(e) =>
                      setAdminData({ ...adminData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={adminData.password}
                    onChange={(e) =>
                      setAdminData({ ...adminData, password: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={adminData.confirmPassword}
                    onChange={(e) =>
                      setAdminData({ ...adminData, confirmPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
