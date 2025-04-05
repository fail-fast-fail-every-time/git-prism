import { Button } from '@/components/shadcn/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import Repository, { GitChange } from '@/models/Repository'
import useStore from '@/stores/store'
import { ReactElement } from 'react'

interface DiscardFilesDialogProps {
  changes: GitChange[]
  repo: Repository
  onFilesDiscarded: () => void
  onClose: () => void
}

export default function DiscardFilesDialog({ changes, repo, onFilesDiscarded, onClose }: DiscardFilesDialogProps): ReactElement {
  const runCommand = useStore((store) => store.runCommandOnRepositories)

  const handleDiscardChanges = async (): Promise<void> => {
    changes.forEach((change) => {
      if (change.untracked) {
        window.api.io.deleteFile(window.api.io.joinPaths(repo.path, change.filePath))
      } else {
        runCommand(() => repo.discardChanges(change.filePath), [repo])
      }
    })
    onFilesDiscarded()
    onClose()
  }

  const discardText = changes.length === 1 ? changes[0].fileName : `${changes.length} files`

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="mb-2">Confirm</DialogTitle>
          <DialogDescription>
            Do you want to discard changes in <b>{discardText}</b>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant={'outline'} type="submit" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleDiscardChanges}>
            Discard Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
