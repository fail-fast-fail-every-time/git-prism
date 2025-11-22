import { FormError, FormLabel } from '@/components/Forms'
import RepositorySelector from '@/components/RepositorySelector'
import { Button } from '@/components/shadcn/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import { Input } from '@/components/shadcn/Input'
import Repository from '@/models/Repository'
import useStore, { useSelectedWorkspace } from '@/stores/store'
import { ReactElement, useState } from 'react'

interface CreateBranchDialogProps {
  onClose: () => void
  repository?: Repository | undefined
}
export default function CreateBranchDialog({ onClose, repository }: CreateBranchDialogProps): ReactElement {
  const [branchName, setbranchName] = useState('')
  const [formError, setFormError] = useState<string | undefined>(undefined)
  const runCommand = useStore((store) => store.runCommandOnRepositories)
  const defaultSelectedRepos = repository ? [repository] : []
  const [selectedRepositories, setSelectedRepositories] = useState<Repository[]>(defaultSelectedRepos)

  const workspace = useSelectedWorkspace()

  const handleCreateBranch = (): void => {
    if (branchName.length === 0) {
      setFormError('Enter branch name')
      return
    }
    if (selectedRepositories.length === 0) {
      setFormError('Select at least one repository')
      return
    }
    runCommand(async (r) => r.createBranch(branchName, true), selectedRepositories)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="dialog-medium">
        <DialogHeader>
          <DialogTitle>Create branch</DialogTitle>
          <DialogDescription>Creates a new branch with the specified name.</DialogDescription>
        </DialogHeader>
        <FormLabel htmlFor="branchName">Branch name</FormLabel>
        <Input
          id="branchName"
          value={branchName}
          onChange={(e) => setbranchName(e.target.value)}
          onKeyDown={(e) => e.key == 'Enter' && handleCreateBranch()}
        />
        <FormLabel>Repositories</FormLabel>
        <RepositorySelector
          options={workspace?.repositories ?? []}
          defaultValues={defaultSelectedRepos}
          onValueChange={setSelectedRepositories}
        />
        <FormError>{formError}</FormError>
        <DialogFooter>
          <Button variant={'outline'} type="submit" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleCreateBranch}>
            Create branch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
