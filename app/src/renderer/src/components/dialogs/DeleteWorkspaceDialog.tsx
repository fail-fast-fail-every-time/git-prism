import { Button } from '@/components/shadcn/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import Workspace from '@/models/Workspace'
import useStore from '@/stores/store'
import { ReactElement } from 'react'

interface DeleteWorkspaceDialogProps {
  workspace: Workspace
  onClose: () => void
}

export default function DeleteWorkspaceDialog({ workspace, onClose }: DeleteWorkspaceDialogProps): ReactElement {
  const deleteWorkspace = useStore((state) => state.deleteWorkspace)

  function handleDeleteWorkspace(): void {
    deleteWorkspace(workspace.name)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="mb-2">Confirm</DialogTitle>
          <DialogDescription>Are you sure you want to remove the workspace {workspace.name} from Git Prism?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant={'outline'} type="submit" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleDeleteWorkspace}>
            Remove workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
