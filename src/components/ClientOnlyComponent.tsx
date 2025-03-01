'use client';

import { useEffect } from 'react';
import registerServiceWorker from '~/utils/serviceWorkerRegister';

const ClientOnlyComponent = () => {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
};

export default ClientOnlyComponent;
