import { FormLabel } from '@/components/Forms'
import RepositorySelector from '@/components/RepositorySelector'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import Repository from '@/models/Repository'
import useStore, { useSelectedWorkspace } from '@/stores/store'
import { ReactElement, useMemo, useState } from 'react'
import { getLocalBranchesFromRepositoryList as getBranchesFromRepositoryList } from '../../Util'
import { BranchList } from '../BranchList'
import { Button } from '../shadcn/Button'

interface MergeBranchDialogProps {
  onClose: () => void
  repository?: Repository | undefined
}

export default function MergeBranchDialog({ onClose, repository }: MergeBranchDialogProps): ReactElement {
  const workspace = useSelectedWorkspace()
  const runCommand = useStore((store) => store.runCommandOnRepositories)
  const recentBranches = repository ? useStore((store) => store.recentBranchesPerRepo[repository.path]) : undefined
  const defaultSelectedRepos = repository ? [repository] : (workspace?.repositories ?? [])
  const [selectedRepositories, setSelectedRepositories] = useState<Repository[]>(defaultSelectedRepos)
  const branches = useMemo(() => getBranchesFromRepositoryList(selectedRepositories, false), [selectedRepositories])

  if (!workspace) {
    return <></>
  }

  const handleSelectBranch = (selectedBranch: string): void => {
    const reposToApplyMerge = repository
      ? [repository]
      : selectedRepositories.filter((repo) => repo.branches?.find((b) => b.name == selectedBranch) !== undefined)
    runCommand((r) => r.merge(selectedBranch), reposToApplyMerge)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="dialog-medium">
        <DialogHeader>
          <DialogTitle>Merge branch</DialogTitle>
          <DialogDescription>Merge a branch into selected repositories</DialogDescription>
        </DialogHeader>
        <FormLabel>Repositories</FormLabel>
        <RepositorySelector
          options={workspace?.repositories ?? []}
          defaultValues={defaultSelectedRepos}
          onValueChange={setSelectedRepositories}
        />
        <div>
          <FormLabel className="mt-2">Branch</FormLabel>
          <BranchList branches={branches} recentBranches={recentBranches} onSelectBranch={handleSelectBranch} />
        </div>
        <DialogFooter>
          <Button variant={'outline'} type="submit" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={onClose}>
            Merge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
