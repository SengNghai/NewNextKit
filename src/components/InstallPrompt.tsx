import { useEffect, useState } from "react"

export default function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    const styles = {
      backgroundColor: 'blue',
      color: '#ffffff',
      borderRadius: '8px',
      padding: '8px 16px'
    }
   
    useEffect(() => {
      setIsIOS(
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as unknown as { MSStream: boolean }).MSStream
      );
   
      setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    }, [])
   
    if (isStandalone) {
      return null // Don't show install button if already installed
    }
   
    return (
      <div>
        <h3 style={{color: 'red'}}>Install App</h3>
        <button style={styles}>Add to Home Screen</button>
        {isIOS && (
          <p>
            To install this app on your iOS device, tap the share button
            <span role="img" aria-label="share icon">
              {' '}
              ⎋{' '}
            </span>
            and then "Add to Home Screen"
            <span role="img" aria-label="plus icon">
              {' '}
              ➕{' '}
            </span>.
          </p>
        )}
      </div>
    )
  }
   