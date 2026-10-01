import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/** False during server rendering and hydration, true in the browser afterwards */
export const useIsClient = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
