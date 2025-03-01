
import { useEffect, useState } from "react";

export default function ClientCurrentDomain() {
    const [currentDomain, setCurrentDomain] = useState<string>('');
    useEffect(() => {

        let fetchDomain = async () => {
            try {
                let res = await fetch('/api/domain');
                const {currentDomain } = await res.json();
                console.log(currentDomain);
                setCurrentDomain(currentDomain);
            } catch (error) {
                console.log(error);
            }
        }
        fetchDomain();
        
    }, [])
    return (
        <div>
            <h1>当前域名是: {currentDomain}</h1>
        </div>
    );
}


