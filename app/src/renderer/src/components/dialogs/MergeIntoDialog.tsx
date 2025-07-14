import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import Repository from '@/models/Repository'
import useStore, { useSelectedWorkspace } from '@/stores/store'
import { ReactElement, useMemo, useState } from 'react'
import { getLocalBranchesFromRepositoryList as getBranchesFromRepositoryList } from '../../Util'
import { BranchList } from '../BranchList'
import Spinner from '../Spinner'

interface MergeIntoDialogProps {
  onClose: () => void
  repository: Repository
}

export default function MergeIntoDialog({ onClose, repository }: MergeIntoDialogProps): ReactElement {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const selectedWorkspace = useSelectedWorkspace()
  const runCommand = useStore((store) => store.runCommandOnRepositories)
  const branches = useMemo(() => getBranchesFromRepositoryList([repository], false), [repository])
  const recentBranches = useStore((store) => store.recentBranchesPerRepo[repository.path])

  if (!selectedWorkspace || !repository.branch) {
    return <></>
  }

  const handleSelectBranch = async (selectedBranch: string): Promise<void> => {
    setIsLoading(true)
    const currentBranch = repository.branch
    if (currentBranch) {
      await runCommand(
        async (r) => {
          await r.checkoutBranch(selectedBranch)
          await r.merge(currentBranch)
        },
        [repository]
      )
    }
    setIsLoading(false)
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
        {isLoading && <Spinner />}
        {!isLoading && <BranchList branches={branches} recentBranches={recentBranches} onSelectBranch={handleSelectBranch} />}
      </DialogContent>
    </Dialog>
  )
}
