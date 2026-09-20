import { createNavigationContainerRef } from '@react-navigation/native'

// Lets code outside any screen (e.g. tapping a push notification) navigate.
export const navigationRef = createNavigationContainerRef()

// Walks up the navigator tree to find the Drawer navigator, regardless of
// how many stacks/tabs the calling screen is nested under.
export function openDrawer(navigation) {
  let nav = navigation
  while (nav && typeof nav.openDrawer !== 'function') {
    nav = nav.getParent?.()
  }
  nav?.openDrawer?.()
}
