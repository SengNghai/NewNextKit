
'use client'
import { useEffect, useState } from 'react';

const NetworkedStatus = () => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const getNetworkStatus = () => {
      const line = navigator.onLine;
      setIsOnline(line);
    }
    getNetworkStatus();
    
    return () => {
      getNetworkStatus();
    };
  }, []);

  return (
    <div>
      <h1>网络状态: {isOnline ? '在线' : '离线'}</h1>
    </div>
  );
};

export default NetworkedStatus;