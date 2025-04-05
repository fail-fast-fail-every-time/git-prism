import DeleteWorkspaceDialog from '@/components/dialogs/DeleteWorkspaceDialog'
import RenameWorkspaceDialog from '@/components/dialogs/RenameWorkspaceDialog'

import { Button } from '@/components/shadcn/Button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/shadcn/DropdownMenu'
import Workspace from '@/models/Workspace'
import useStore, { useSelectedWorkspace } from '@/stores/store'
import { CircleX, Ellipsis, Folder, FolderDot, FolderOpen, FolderOpenDot, FolderPen } from 'lucide-react'
import { ReactElement, useState } from 'react'

interface SideMenuWorkspaceProps {
  workspace: Workspace
}

export default function WorkspaceItem({ workspace }: SideMenuWorkspaceProps): ReactElement {
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showDeleteConfirm, setDeleteConfirm] = useState(false)
  const selectedWorkspace = useSelectedWorkspace()

  const setSelectedWorkspace = useStore((state) => state.setSelectedWorkspace)

  function handleWorkSpaceClick(workspace: Workspace): void {
    setSelectedWorkspace(workspace.name)
  }

  //Sum the number of changes for each repository in the workspace
  const totalChanges = workspace.repositories.reduce((acc, repo) => acc + repo.changes.length, 0)

  const isCurrent = workspace.name == selectedWorkspace?.name

  let Icon = totalChanges > 0 ? FolderDot : Folder
  if (isCurrent) {
    Icon = totalChanges > 0 ? FolderOpenDot : FolderOpen
  }

  return (
    <>
      <div className="relative flex" key={workspace.name}>
        <Button
          onClick={() => handleWorkSpaceClick(workspace)}
          variant={isCurrent ? 'menuSelected' : 'menu'}
          className="justify-start gap-2 w-full max-w-full"
        >
          <Icon />
          <span className="max-w-[80%] truncate">{workspace.name}</span>
        </Button>
        <div className="top-1/2 right-0 absolute pt-2 pr-2 -translate-y-1/2">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis size={20} color="#71717a" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowRenameDialog(true)}>
                <FolderPen />
                Rename Workspace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteConfirm(true)}>
                <CircleX />
                Remove Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {showRenameDialog && <RenameWorkspaceDialog workspace={workspace} onClose={() => setShowRenameDialog(false)} />}
        {showDeleteConfirm && <DeleteWorkspaceDialog workspace={workspace} onClose={() => setDeleteConfirm(false)} />}
      </div>
    </>
  )
}
