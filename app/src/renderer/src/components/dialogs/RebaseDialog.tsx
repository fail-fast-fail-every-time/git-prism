import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import Repository from '@/models/Repository'
import useStore, { useCheckedRepos, useSelectedWorkspace } from '@/stores/store'
import { ReactElement, useMemo } from 'react'
import { getLocalBranchesFromRepositoryList as getBranchesFromRepositoryList } from '../../Util'
import { BranchList } from '../BranchList'

interface RebaseDialogProps {
  onClose: () => void
  repository?: Repository | undefined
}

export default function RebaseDialog({ onClose, repository }: RebaseDialogProps): ReactElement {
  const selectedWorkspace = useSelectedWorkspace()
  const checkedRepos = useCheckedRepos()
  const runCommand = useStore((store) => store.runCommandOnRepositories)
  const branches = useMemo(() => getBranchesFromRepositoryList(repository ? [repository] : checkedRepos, true), [repository])
  const recentBranches = repository ? useStore((store) => store.recentBranchesPerRepo[repository.path]) : undefined

  if (!selectedWorkspace) {
    return <></>
  }

  const handleRebase = (branchName: string): void => {
    //Apply rebase to the selected repository or to all checked repositories that have the selected branch
    const reposToRebase = repository
      ? [repository]
      : checkedRepos.filter((repo) => repo.branches?.find((b) => b.name == branchName) !== undefined)
    runCommand((r) => r.rebase([branchName]), reposToRebase)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rebase branch</DialogTitle>
          <DialogDescription>
            Rebase {repository ? <b>{repository.name}</b> : `${checkedRepos.length} checked repositories`}
          </DialogDescription>
        </DialogHeader>
        <BranchList branches={branches} recentBranches={recentBranches} onSelectBranch={handleRebase} />
      </DialogContent>
    </Dialog>
  )
}
