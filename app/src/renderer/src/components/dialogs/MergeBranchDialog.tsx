import { FormLabel } from '@/components/Forms'
import RepositorySelector from '@/components/RepositorySelector'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import Repository from '@/models/Repository'
import useStore, { useSelectedWorkspace } from '@/stores/store'
import { ReactElement, useMemo, useState } from 'react'
import { getLocalBranchesFromRepositoryList as getBranchesFromRepositoryList } from '../../Util'
import { BranchList } from '../BranchList'
import ConfirmDialog from '../ConfirmDialog'

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
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)

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
        <BranchList branches={branches} recentBranches={recentBranches} onSelectBranch={setSelectedBranch} />
        <FormLabel>Repositories</FormLabel>
        <RepositorySelector
          options={workspace?.repositories ?? []}
          defaultValues={defaultSelectedRepos}
          onValueChange={setSelectedRepositories}
        />
        {selectedBranch && (
          <ConfirmDialog
            title="Confirm merge"
            text={`Are you sure you want to merge branch <b>${selectedBranch}</b> into ${selectedRepositories.length == 1 ? `<b>${selectedRepositories[0].name}</b>` : `<b>${selectedRepositories.length} repositories</b>`}?`}
            onCancel={() => setSelectedBranch(null)}
            onConfirm={() => handleSelectBranch(selectedBranch)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
