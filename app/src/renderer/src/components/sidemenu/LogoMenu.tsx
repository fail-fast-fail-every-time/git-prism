import SettingsDialog from '@/components/dialogs/SettingsDialog'
import { Button } from '@/components/shadcn/Button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/shadcn/DropdownMenu'
import About from '@/components/sidemenu/About'
import { ChevronsUpDown, Info, Pyramid, Settings } from 'lucide-react'
import { ReactElement, useState } from 'react'

export default function LogoMenu(): ReactElement {
  const [showSettings, setShowSettings] = useState(false)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative justify-start py-5 pl-3 border border-input w-full">
            <Pyramid size={16} />
            <span className="flex flex-col">Git Prism</span>
            <ChevronsUpDown className="right-2 absolute" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem onClick={() => setShowSettings(true)}>
            <Settings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowAbout(true)}>
            <Info />
            About
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {showAbout && <About onClose={() => setShowAbout(false)} />}
      {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} />}
    </>
  )
}
