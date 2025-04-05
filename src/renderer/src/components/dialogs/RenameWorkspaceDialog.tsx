import { FormError, FormLabel } from '@/components/Forms'
import { Button } from '@/components/shadcn/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import { Input } from '@/components/shadcn/Input'
import Workspace from '@/models/Workspace'
import useStore from '@/stores/store'
import { ReactElement, useState } from 'react'

interface RenameWorkspaceDialogProps {
  workspace: Workspace
  onClose: () => void
}

export default function RenameWorkspaceDialog({ onClose, workspace }: RenameWorkspaceDialogProps): ReactElement {
  const workspaces = useStore((state) => state.workspaces)
  const rename = useStore((state) => state.renameWorkspace)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [formError, setFormError] = useState<string | undefined>(undefined)

  async function renameWorkspace(): Promise<void> {
    if (newWorkspaceName.length === 0) {
      setFormError('Please enter a new workspace name')
      return
    }
    const alreadyExists = workspaces.find((w: Workspace) => w.name.toLowerCase() === newWorkspaceName.toLowerCase() && w != workspace)
    if (!alreadyExists) {
      rename(workspace.name, newWorkspaceName)
      onClose()
    } else {
      setFormError('A workspace with this name already exists')
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename workspace</DialogTitle>
          <DialogDescription>Enter a new name for the workspace.</DialogDescription>
        </DialogHeader>
        <FormLabel htmlFor="workspaceName">Workspace name</FormLabel>
        <Input
          id="workspaceName"
          defaultValue={workspace.name}
          onKeyDown={(e) => e.key == 'Enter' && renameWorkspace()}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
        />
        <FormError>{formError}</FormError>
        <DialogFooter>
          <Button type="submit" onClick={renameWorkspace}>
            Rename workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
