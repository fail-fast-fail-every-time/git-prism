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
  const recentBranchesPerRepo = useStore((store) => store.recentBranchesPerRepo)
  const runCommand = useStore((store) => store.runCommandOnRepositories)
  const defaultSelectedRepos = repository ? [repository] : (workspace?.repositories ?? [])
  const [selectedRepositories, setSelectedRepositories] = useState<Repository[]>(defaultSelectedRepos)
  const branches = useMemo(() => getBranchesFromRepositoryList(selectedRepositories, false), [selectedRepositories])
  const recentBranches = selectedRepositories.length === 1 ? recentBranchesPerRepo[selectedRepositories[0].path] : undefined
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)

  //Do the actual merge when clicking on submit
  const handleMerge = (): void => {
    if (!selectedBranch) {
      return
    }
    const reposToApplyMerge = selectedRepositories.filter((repo) => repo.branches?.find((b) => b.name == selectedBranch) !== undefined)
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
            text={getMergeText(selectedBranch, selectedRepositories)}
            onConfirm={() => handleMerge()}
            onCancel={() => setSelectedBranch(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function getMergeText(selectedBranch: string, selectedRepositories: Repository[]): string {
  return `${selectedRepositories.length == 1
    ? `Merge <b>${selectedBranch}</b> into <b>${selectedRepositories[0].branch}</b> on <b>${selectedRepositories[0].name}</b>?`
    : `Merge <b>${selectedBranch}</b> into <b>${selectedRepositories.length} repositories</b>?`
    }`
}
