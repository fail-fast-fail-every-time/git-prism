import { Separator } from '@/components/shadcn/Separator'
import { Switch } from '@/components/shadcn/Switch'
import { useTheme } from '@/components/shadcn/ThemeProvider'
import AddWorkspaceButton from '@/components/sidemenu/AddWorkspaceButton'
import LogoMenu from '@/components/sidemenu/LogoMenu'
import WorkspaceItem from '@/components/sidemenu/WorkspaceItem'
import Workspace from '@/models/Workspace'
import useStore from '@/stores/store'
import { ReactElement } from 'react'

export default function SideMenu(): ReactElement {
  const workspaces = useStore((state) => state.workspaces)
  const { setTheme, theme } = useTheme()

  const workspacesSortedByName = workspaces.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <aside className="flex-shrink-0 bg-sidemenu pt-2 pr-2 pl-2 border-r w-[270px]">
      <LogoMenu />
      <h2 className="mt-7 mb-2 pl-2 text-foreground/60 text-xs">Workspaces</h2>
      {workspacesSortedByName.map((workspace: Workspace) => (
        <WorkspaceItem key={workspace.name} workspace={workspace} />
      ))}
      <Separator className="mt-3" />
      <div className="content-center mt-2">
        <AddWorkspaceButton />
      </div>
      <div className="bottom-5 absolute flex gap-2 bg-sidemenu pl-2 text-sm">
        <span>Dark mode</span>
        <Switch checked={theme == 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
      </div>
    </aside>
  )
}
