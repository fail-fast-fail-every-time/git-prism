import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import Repository from '@/models/Repository'
import useStore, { useSelectedWorkspace } from '@/stores/store'
import { ReactElement, useMemo } from 'react'
import { getLocalBranchesFromRepositoryList as getBranchesFromRepositoryList } from '../../Util'
import { BranchList } from '../BranchList'

interface MergeIntoDialogProps {
  onClose: () => void
  repository: Repository
}

export default function MergeIntoDialog({ onClose, repository }: MergeIntoDialogProps): ReactElement {
  const selectedWorkspace = useSelectedWorkspace()
  const runCommand = useStore((store) => store.runCommandOnRepositories)
  const branches = useMemo(() => getBranchesFromRepositoryList([repository], false), [repository])
  const recentBranches = useStore((store) => store.recentBranchesPerRepo[repository.path])

  if (!selectedWorkspace || !repository.branch) {
    return <></>
  }

  const handleSelectBranch = (selectedBranch: string): void => {
    const currentBranch = repository.branch
    if (currentBranch) {
      runCommand((r) => r.checkoutBranch(selectedBranch), [repository])
      if (!repository.lastError) {
        runCommand((r) => r.merge(currentBranch), [repository])
      }
    }
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Merge branch</DialogTitle>
          <DialogDescription>
            Merge <b>{repository.branch}</b> into another branch on <b>{repository.name}</b>
          </DialogDescription>
        </DialogHeader>
        <BranchList branches={branches} recentBranches={recentBranches} onSelectBranch={handleSelectBranch} />
      </DialogContent>
    </Dialog>
  )
}
