import RepositorySelector from '@/components/RepositorySelector'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import Repository from '@/models/Repository'
import useStore, { useSelectedWorkspace } from '@/stores/store'
import { ReactElement, useMemo, useState } from 'react'
import { getLocalBranchesFromRepositoryList as getBranchesFromRepositoryList } from '../../Util'
import { BranchList } from '../BranchList'
import { FormLabel } from '../Forms'

interface RebaseDialogProps {
  onClose: () => void
  repository?: Repository | undefined
}

export default function RebaseDialog({ onClose, repository }: RebaseDialogProps): ReactElement {
  const workspace = useSelectedWorkspace()
  const runCommand = useStore((store) => store.runCommandOnRepositories)
  const recentBranches = repository ? useStore((store) => store.recentBranchesPerRepo[repository.path]) : undefined
  const defaultSelectedRepos = repository ? [repository] : (workspace?.repositories ?? [])
  const [selectedRepositories, setSelectedRepositories] = useState<Repository[]>(defaultSelectedRepos)
  const branches = useMemo(() => getBranchesFromRepositoryList(selectedRepositories, true), [selectedRepositories])

  if (!workspace) {
    return <></>
  }

  const handleRebase = (branchName: string): void => {
    // Apply rebase to the selected repository or to all selected repositories that have the selected branch
    const reposToRebase = repository
      ? [repository]
      : selectedRepositories.filter((repo) => repo.branches?.find((b) => b.name == branchName) !== undefined)
    runCommand((r) => r.rebase([branchName]), reposToRebase)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="dialog-medium">
        <DialogHeader>
          <DialogTitle>Rebase branch</DialogTitle>
          <DialogDescription>
            Rebase {repository ? <b>{repository.name}</b> : `${selectedRepositories.length} selected repositories`}
          </DialogDescription>
        </DialogHeader>
        <BranchList branches={branches} recentBranches={recentBranches} onSelectBranch={handleRebase} />
        <FormLabel className="mt-3">Repositories</FormLabel>
        <RepositorySelector
          options={workspace?.repositories ?? []}
          defaultValues={defaultSelectedRepos}
          onValueChange={setSelectedRepositories}
        />
      </DialogContent>
    </Dialog>
  )
}
