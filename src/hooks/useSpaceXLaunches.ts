import { useState, useEffect } from 'react';
import type { SpaceXLaunch } from '@/types/spacex';

export const useSpaceXLaunches = () => {
  const [data, setData] = useState<SpaceXLaunch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLaunches = async () => {
      try {
        const response = await fetch('https://api.spacexdata.com/v5/launches/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: {},
            options: {
              pagination: false,
              select: [
                'id',
                'name',
                'date_utc',
                'flight_number',
                'success',
                'upcoming',
                'rocket',
                'launchpad',
                'payloads',
                'orbit'
              ],
              populate: ['rocket', 'launchpad', 'payloads'],
              sort: {
                flight_number: 'desc'
              }
            }
          })
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setData(data.docs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLaunches();
  }, []);

  return { data, isLoading, error };
};

export const useLatestLaunch = () => {
  const [data, setData] = useState<SpaceXLaunch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await fetch('https://api.spacexdata.com/v5/launches/latest');
        if (!response.ok) throw new Error('Failed to fetch');
        const launch = await response.json();
        
        const populatedResponse = await fetch(`https://api.spacexdata.com/v5/launches/${launch.id}`);
        if (!populatedResponse.ok) throw new Error('Failed to fetch populated latest launch');
        const populatedLaunch = await populatedResponse.json();

        const rocketResponse = await fetch(`https://api.spacexdata.com/v4/rockets/${populatedLaunch.rocket}`);
        const rocketData = await rocketResponse.json();

        const launchpadResponse = await fetch(`https://api.spacexdata.com/v4/launchpads/${populatedLaunch.launchpad}`);
        const launchpadData = await launchpadResponse.json();

        setData({
          ...populatedLaunch,
          rocket: rocketData,
          launchpad: launchpadData,
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatest();
  }, []);

  return { data, isLoading, error };
};