import Repository from '@/models/Repository'
import useStore from '@/stores/store'
import { getBranchList } from '@/Util'
import { Check, ChevronDown, GitBranch } from 'lucide-react'
import { ReactElement, useState } from 'react'
import { cn } from 's/lib/utils'
import { Button } from './shadcn/Button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './shadcn/command'
import { Popover, PopoverContent, PopoverTrigger } from './shadcn/popover'

interface BranchSelectorProps {
  repo: Repository
}

export default function BranchSelector({ repo }: BranchSelectorProps): ReactElement {
  const [open, setOpen] = useState(false)
  const runRepoCommand = useStore((store) => store.runCommandOnRepositories)
  const addRecentBranch = useStore((store) => store.addRecentBranch)
  const recentBranches = useStore((store) => store.recentBranchesPerRepo[repo.path]) || []
  const allBranchesExceptRecentBranches = getBranchList(repo, true).filter((branch) => !recentBranches?.includes(branch))

  const handleSelectValue = async (newBranch: string): Promise<void> => {
    if (newBranch != repo.branch) {
      setOpen(false)
      runRepoCommand(async () => await repo.checkoutBranch(newBranch), [repo])
      addRecentBranch(repo.path, newBranch)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" role="combobox" aria-expanded={open} className="justify-start px-2" onClick={(e) => e.stopPropagation()}>
          <GitBranch size={14} className="inline-block" />
          <div className="max-w-[300px] truncate">{repo.branch}</div>
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]" onClick={(e) => e.stopPropagation()}>
        <Command>
          <CommandInput placeholder="Search branch..." />
          <CommandList>
            <CommandEmpty>No branches found.</CommandEmpty>
            {recentBranches.length > 0 && (
              <CommandGroup heading="Recent branches">
                {recentBranches.map((branch: string) => (
                  <BranchCommandItem
                    key={branch}
                    branch={branch}
                    onSelect={() => handleSelectValue(branch)}
                    selected={repo.branch === branch}
                  />
                ))}
              </CommandGroup>
            )}
            <CommandGroup heading={recentBranches.length > 0 ? 'Other Branches' : 'Branches'}>
              {allBranchesExceptRecentBranches.map((branch: string) => (
                <BranchCommandItem
                  key={branch}
                  branch={branch}
                  onSelect={() => handleSelectValue(branch)}
                  selected={repo.branch === branch}
                />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function BranchCommandItem({
  branch,
  onSelect,
  selected
}: {
  branch: string
  onSelect: () => Promise<void>
  selected: boolean
}): ReactElement {
  return (
    <CommandItem value={branch} onSelect={onSelect}>
      <Check className={cn('mr-2 h-4 w-4', selected ? 'opacity-100' : 'opacity-0')} />
      {branch}
    </CommandItem>
  )
}
