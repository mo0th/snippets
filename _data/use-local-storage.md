---
title: useLocalStorage
short_description: A hook to save state in localStorage
types:
  - typescript
---

```typescript
import { Dispatch, useEffect, useState } from 'react'

const useLocalStorage = <T>(key: string, initialValue: T): [T, Dispatch<T>, () => void] => {
  const [state, setState] = useState<T>(() => {
    const cached = localStorage.getItem(key)

    if (!cached) return initialValue

    try {
      return JSON.parse(cached)
    } catch (err) {
      return initialValue
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [state, key])

  const clearState = () => {
    setState(initialValue)
  }

  return [state, setState, clearState]
}
```
