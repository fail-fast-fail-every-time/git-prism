import TitleBar from '@/components/TitleBar'
import { ThemeProvider } from '@/components/shadcn/ThemeProvider'
import SideMenu from '@/components/sidemenu/SideMenu'
import '@/stores/store'
import { useStore } from '@/stores/store'
import { useEffect } from 'react'
import GlobalAlert from './components/GlobalAlert'
import WorkspaceView from './components/WorkspaceView'

function App(): JSX.Element {
  const initialize = useStore((state) => state.initialize)
  useEffect(() => {
    initialize()
  })

  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <div className="flex min-h-screen">
        <SideMenu />
        <main className="relative flex-1">
          <TitleBar />
          <WorkspaceView />
          <GlobalAlert />
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
