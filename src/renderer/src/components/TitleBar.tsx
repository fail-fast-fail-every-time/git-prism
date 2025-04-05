import { Button } from '@/components/shadcn/Button'
import { useSelectedWorkspace } from '@/stores/store'
import { Minus, Square, X } from 'lucide-react'
import { ReactElement } from 'react'

export default function TitleBar(): ReactElement {
  const selectedWorkspace = useSelectedWorkspace()
  return (
    <div className="drag">
      <div className="pt-4 pr-36 pl-6">{selectedWorkspace?.name}</div>
      <div className="top-0 right-0 absolute">
        <Button className="no-drag" variant="ghost" onClick={() => window.electron.ipcRenderer.send('minimizeApp')}>
          <Minus />
        </Button>
        <Button className="no-drag" variant="ghost" onClick={() => window.electron.ipcRenderer.send('maximizeApp')}>
          <Square />
        </Button>
        <Button className="no-drag" variant="ghost" onClick={() => window.electron.ipcRenderer.send('closeApp')}>
          <X />
        </Button>
      </div>
    </div>
  )
}
