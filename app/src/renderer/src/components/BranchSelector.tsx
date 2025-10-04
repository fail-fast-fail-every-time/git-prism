import Repository from '@/models/Repository'
import useStore from '@/stores/store'
import { getBranchList } from '@/Util'
import { Check, ChevronDown, GitBranch, GitBranchIcon } from 'lucide-react'
import { ReactElement, useState } from 'react'
import CopyButton from './CopyButton'
import { Button } from './shadcn/Button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './shadcn/command'
import { Popover, PopoverContent, PopoverTrigger } from './shadcn/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from './shadcn/Tooltip'

interface BranchSelectorProps {
  repo: Repository
}

export default function BranchSelector({ repo }: BranchSelectorProps): ReactElement {
  const [open, setOpen] = useState(false)
  const runRepoCommand = useStore((store) => store.runCommandOnRepositories)
  const addRecentBranch = useStore((store) => store.addRecentBranch)
  const recentBranches = useStore((store) => store.recentBranchesPerRepo[repo.path]) || []
  const allBranchesExceptRecentBranches = getBranchList(repo, true).filter((branch) => !recentBranches?.includes(branch))

  //Ensure the current branch is always on top of the most recent branches list
  if (repo.branch && repo.branch !== recentBranches[0]) {
    addRecentBranch(repo.path, repo.branch)
  }

  //Handle branch selection
  const handleSelectValue = async (newBranch: string): Promise<void> => {
    //Only checkout if the selected branch is different from the current one
    if (newBranch != repo.branch) {
      setOpen(false)
      await runRepoCommand(async () => await repo.checkoutBranch(newBranch), [repo])
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
      <PopoverContent className="p-0 w-[450px]" onClick={(e) => e.stopPropagation()}>
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
    <CommandItem value={branch} onSelect={onSelect} className="group flex cursor-pointer">
      {selected && <Check className="mr-2 w-4 h-4" />}
      {!selected && <GitBranchIcon className="mr-2 w-4 h-4" />}
      <div className="flex-1">{branch}</div>
      <Tooltip>
        <TooltipTrigger>
          <CopyButton text={branch} className="opacity-0 group-hover:opacity-100 pr-0 h-6" />
        </TooltipTrigger>
        <TooltipContent>Copy branch name</TooltipContent>
      </Tooltip>
    </CommandItem>
  )
}
