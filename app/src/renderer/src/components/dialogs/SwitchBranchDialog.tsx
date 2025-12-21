import { FormLabel } from '@/components/Forms'
import RepositorySelector from '@/components/RepositorySelector'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import Repository from '@/models/Repository'
import useStore, { useSelectedWorkspace } from '@/stores/store'
import { ReactElement, useMemo, useState } from 'react'
import { getLocalBranchesFromRepositoryList as getBranchesFromRepositoryList } from '../../Util'
import { BranchList } from '../BranchList'

interface SwitchBranchDialogProps {
  onClose: () => void
  repository?: Repository | undefined
}

export default function SwitchBranchDialog({ onClose, repository }: SwitchBranchDialogProps): ReactElement {
  const workspace = useSelectedWorkspace()
  const runCommand = useStore((store) => store.runCommandOnRepositories)
  const recentBranches = repository ? useStore((store) => store.recentBranchesPerRepo[repository.path]) : undefined
  const defaultSelectedRepos = repository ? [repository] : (workspace?.repositories ?? [])
  const [selectedRepositories, setSelectedRepositories] = useState<Repository[]>(defaultSelectedRepos)
  const branches = useMemo(() => getBranchesFromRepositoryList(selectedRepositories, true), [selectedRepositories])

  if (!workspace) {
    return <></>
  }

  const handleSelectBranch = (branchName: string): void => {
    //Only switch branch for repositories where the branch exists
    const reposToSwitch = selectedRepositories.filter(
      (repo) => repo.branches?.find((b) => b.name == branchName || 'remotes/' + branchName === b.name) !== undefined
    )
    runCommand((r) => r.checkoutBranch(branchName), reposToSwitch)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="dialog-medium">
        <DialogHeader>
          <DialogTitle>Switch branch</DialogTitle>
          <DialogDescription>
            Switch the branch on selected repositories. The branch will only be changed for repositories where the selected branch exists;
            otherwise, they will stay on their current branch.
          </DialogDescription>
        </DialogHeader>
        <BranchList branches={branches} recentBranches={recentBranches} onSelectBranch={handleSelectBranch} />
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
