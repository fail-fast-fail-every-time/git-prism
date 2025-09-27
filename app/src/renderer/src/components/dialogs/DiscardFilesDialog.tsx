import { Button } from '@/components/shadcn/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import Repository, { GitChange } from '@/models/Repository'
import useStore from '@/stores/store'
import { ReactElement, useState } from 'react'
import Spinner from '../Spinner'

interface DiscardFilesDialogProps {
  changes: GitChange[]
  repo: Repository
  onFilesDiscarded: () => void
  onClose: () => void
}

export default function DiscardFilesDialog({ changes, repo, onFilesDiscarded, onClose }: DiscardFilesDialogProps): ReactElement {
  const [isLoading, setIsLoading] = useState(false)
  const runCommand = useStore((store) => store.runCommandOnRepositories)

  const handleDiscardChanges = async (): Promise<void> => {
    setIsLoading(true)
    const trackedChanges = changes.filter((change) => !change.untracked)
    if (trackedChanges.length > 0) {
      await runCommand(() => repo.discardChanges(trackedChanges.map((c) => c.filePath)), [repo])
    }

    const untrackedChanges = changes.filter((change) => change.untracked)
    if (untrackedChanges.length > 0) {
      untrackedChanges.forEach((change) => {
        window.api.io.deleteFile(window.api.io.joinPaths(repo.path, change.filePath))
      })
    }
    setIsLoading(false)
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
          <Button variant={'outline'} type="submit" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleDiscardChanges} disabled={isLoading}>
            {isLoading ? <span className="flex items-center gap-2">{<Spinner />} Discarding...</span> : 'Discard Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
