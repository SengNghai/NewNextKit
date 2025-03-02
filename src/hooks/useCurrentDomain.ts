import { useEffect, useState } from "react";

export const useCurrentDomain = () => {
  const [currentDomain, setCurrentDomain] = useState<string>('');

  useEffect(() => {
    const fetchDomain = async () => {
      try {
        const res = await fetch('/api/domain');
        const { currentDomain } = await res.json();
        console.log(currentDomain);
        setCurrentDomain(currentDomain);
      } catch (error) {
        console.log(error);
      }
    }

    fetchDomain();
  }, []);

  return currentDomain;
};
