import { useEffect } from 'react'

const useKeyPressed = (key: string, onKeyPressed: () => void): void => {
  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === key) {
      onKeyPressed()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return (): void => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])
}

export default useKeyPressed
