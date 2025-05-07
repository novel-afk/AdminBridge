import { useState, useEffect } from 'react';
import axios from 'axios';

interface UseApiOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  dependencies?: any[];
}

export const useApi = ({ url, method = 'GET', body, dependencies = [] }: UseApiOptions) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios({
          method,
          url: `http://localhost:8000/api${url}`,
          data: body,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        setData(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, isLoading, error };
};
