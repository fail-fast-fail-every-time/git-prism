import { GitBranchIcon } from 'lucide-react'
import { ReactElement } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './shadcn/command'

interface BranchListProps {
  branches: string[]
  onSelectBranch: (branch: string) => void
  recentBranches?: string[]
}

export function BranchList({ branches, onSelectBranch, recentBranches }: BranchListProps): ReactElement {
  const localBranches = branches.filter((b) => !b.startsWith('origin/'))
  const localBranchesWithRecent = localBranches.filter((b) => !recentBranches?.includes(b))
  const remoteBranches = branches.filter((b) => b.startsWith('origin/'))

  return (
    <div className="flex flex-col gap-2 h-[400px] overflow-y-auto">
      <Command>
        <CommandInput placeholder="Search branch..." />
        <CommandList>
          <CommandEmpty>No branches found.</CommandEmpty>
          {recentBranches && recentBranches.length > 0 && (
            <CommandGroup heading="Recent branches">
              {recentBranches.map((branch: string) => (
                <BranchCommandItem key={'recent-' + branch} branch={branch} onSelect={() => onSelectBranch(branch)} />
              ))}
            </CommandGroup>
          )}
          {localBranchesWithRecent.length > 0 && (
            <CommandGroup heading="Other branches">
              {localBranchesWithRecent.map((branch: string) => (
                <BranchCommandItem key={'local' + branch} branch={branch} onSelect={() => onSelectBranch(branch)} />
              ))}
            </CommandGroup>
          )}
          {remoteBranches.length > 0 && (
            <CommandGroup heading="Remote branches">
              {remoteBranches.map((branch: string) => (
                <BranchCommandItem key={branch} branch={branch} onSelect={() => onSelectBranch(branch)} />
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </div>
  )
}

function BranchCommandItem({ branch, onSelect }: { branch: string; onSelect: () => void }): ReactElement {
  return (
    <CommandItem value={branch} onSelect={onSelect} className="group flex cursor-pointer">
      <GitBranchIcon className="mr-2 w-4 h-4" />
      <div className="flex-1">{branch}</div>
    </CommandItem>
  )
}
