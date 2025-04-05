import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import Repository from '@/models/Repository'
import useStore, { useCheckedRepos, useSelectedWorkspace } from '@/stores/store'
import { ReactElement, useMemo } from 'react'
import { getLocalBranchesFromRepositoryList as getBranchesFromRepositoryList } from '../../Util'
import { BranchList } from '../BranchList'

interface SwitchBranchDialogProps {
  onClose: () => void
  repository?: Repository | undefined
}

export default function SwitchBranchDialog({ onClose, repository }: SwitchBranchDialogProps): ReactElement {
  const selectedWorkspace = useSelectedWorkspace()
  const checkedRepos = useCheckedRepos()
  const runCommand = useStore((store) => store.runCommandOnRepositories)
  const branches = useMemo(() => getBranchesFromRepositoryList(repository ? [repository] : checkedRepos, true), [repository])
  const recentBranches = repository ? useStore((store) => store.recentBranchesPerRepo[repository.path]) : undefined

  if (!selectedWorkspace) {
    return <></>
  }

  const handleSelectBranch = (branchName: string): void => {
    const reposToSwitch = repository
      ? [repository]
      : checkedRepos.filter((repo) => repo.branches?.find((b) => b.name == branchName) !== undefined)
    runCommand((r) => r.checkoutBranch(branchName), reposToSwitch)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Switch branch</DialogTitle>
          <DialogDescription>
            Switch the branch on {repository ? <b>{repository.name}</b> : 'checked repositories'}. The branch will only be changed for
            repositories where the selected branch exists; otherwise, they will remain on their current branch.
          </DialogDescription>
        </DialogHeader>
        <BranchList branches={branches} recentBranches={recentBranches} onSelectBranch={handleSelectBranch} />
      </DialogContent>
    </Dialog>
  )
}
