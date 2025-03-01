import { useEffect, useState } from 'react';

const APIResponseTime = () => {
  const [responseTime, setResponseTime] = useState<number | null>(null);

  useEffect(() => {
    const fetchAPI = async () => {
      // 记录开始时间
      const startTime = performance.now();

      try {
        const response = await fetch('/api/domain');
        const data = await response.json();

        // 记录结束时间
        const endTime = performance.now();
        const duration = endTime - startTime; // 请求持续时间
        setResponseTime(duration);

        console.log('API Response Data:', data);
      } catch (error) {
        console.error('Error fetching API:', error);
      }
    };

    fetchAPI();
  }, []);

  return (
    <div>
      <h1>接口请求时间: {responseTime ? `${responseTime.toFixed(2)} ms` : '加载中...'}</h1>
      <p style={{color: 'red'}}>API接口: /api/domain</p>
    </div>
  );
};

export default APIResponseTime;
