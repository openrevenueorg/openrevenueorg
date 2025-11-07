import { useState, useEffect } from 'react';

export function useOnboarding() {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  async function checkOnboardingStatus() {
    try {
      const response = await fetch('/api/v1/settings/onboarding-status');
      const data = await response.json();
      setIsOnboarded(data.is_onboarded);
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    } finally {
      setLoading(false);
    }
  }

  return {
    isOnboarded,
    loading,
    checkOnboardingStatus,
  };
}
