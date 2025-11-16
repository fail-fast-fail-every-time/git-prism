import { FormError, FormLabel } from '@/components/Forms'
import { Button } from '@/components/shadcn/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import { Input } from '@/components/shadcn/Input'
import Workspace from '@/models/Workspace'
import useStore from '@/stores/store'
import { ReactElement, useState } from 'react'

interface AddWorkspaceDialogProps {
  onClose: () => void
}

export default function AddWorkspaceDialog({ onClose }: AddWorkspaceDialogProps): ReactElement {
  const workspaces = useStore((state) => state.workspaces)
  const addWorkspace = useStore((state) => state.addWorkspace)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [formError, setFormError] = useState<string | undefined>(undefined)

  async function createWorkspace(): Promise<void> {
    if (newWorkspaceName.length === 0) {
      setFormError('Enter a workspace name')
      return
    }
    const alreadyExists = workspaces.find((w: Workspace) => w.name.toLowerCase() === newWorkspaceName.toLowerCase())
    if (alreadyExists) {
      setFormError('A workspace with this name already exists. Choose a different name.')
      return
    }

    const workspaceId = crypto.randomUUID()
    const newWorkspace = new Workspace(workspaceId, newWorkspaceName, [])
    addWorkspace(newWorkspace)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>Enter a name for the new workspace.</DialogDescription>
        </DialogHeader>
        <FormLabel htmlFor="workspaceName">Name</FormLabel>
        <Input
          id="workspaceName"
          placeholder="Workspace name"
          onKeyDown={(e) => e.key == 'Enter' && createWorkspace()}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
        />
        <FormError>{formError}</FormError>
        <DialogFooter>
          <Button variant={'outline'} type="submit" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={createWorkspace}>
            Add workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
