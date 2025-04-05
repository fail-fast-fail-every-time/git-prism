import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import Repository from '@/models/Repository'
import useStore, { useCheckedRepos, useSelectedWorkspace } from '@/stores/store'
import { ReactElement, useMemo } from 'react'
import { getLocalBranchesFromRepositoryList as getBranchesFromRepositoryList } from '../../Util'
import { BranchList } from '../BranchList'

interface MergeBranchDialogProps {
  onClose: () => void
  repository?: Repository | undefined
}

export default function MergeBranchDialog({ onClose, repository }: MergeBranchDialogProps): ReactElement {
  const selectedWorkspace = useSelectedWorkspace()
  const checkedRepos = useCheckedRepos()
  const runCommand = useStore((store) => store.runCommandOnRepositories)
  const branches = useMemo(() => getBranchesFromRepositoryList(repository ? [repository] : checkedRepos, false), [repository])
  const recentBranches = repository ? useStore((store) => store.recentBranchesPerRepo[repository.path]) : undefined

  if (!selectedWorkspace) {
    return <></>
  }

  const handleSelectBranch = (selectedBranch: string): void => {
    //Apply merge to the selected repository or to all checked repositories that have the selected branch
    const reposToApplyMerge = repository
      ? [repository]
      : checkedRepos.filter((repo) => repo.branches?.find((b) => b.name == selectedBranch) !== undefined)
    runCommand((r) => r.merge(selectedBranch), reposToApplyMerge)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Merge branch</DialogTitle>
          <DialogDescription>Merge a branch into {repository ? <b>{repository.name}</b> : 'checked repositories'}</DialogDescription>
        </DialogHeader>
        <BranchList branches={branches} recentBranches={recentBranches} onSelectBranch={handleSelectBranch} />
      </DialogContent>
    </Dialog>
  )
}
