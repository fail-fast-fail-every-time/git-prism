import { GitBranch } from 'lucide-react'
import { ReactElement, useState } from 'react'
import { Input } from './shadcn/Input'
import { Table, TableBody, TableCell, TableRow } from './shadcn/Table'

interface BranchListProps {
  branches: string[]
  onSelectBranch: (branch: string) => void
  recentBranches?: string[]
}

export function BranchList({ branches, onSelectBranch, recentBranches }: BranchListProps): ReactElement {
  const [filter, setFilter] = useState<string>('')
  const branchesFiltered = branches.filter((b) => b?.includes(filter))
  const localBranches = branchesFiltered.filter((b) => !b.startsWith('origin/'))
  const remoteBranches = branchesFiltered.filter((b) => b.startsWith('origin/'))

  return (
    <div className="flex flex-col gap-2">
      <Input placeholder="Filter branches" value={filter} onChange={(e) => setFilter(e.target.value)} />
      <div className="h-[400px] overflow-y-auto">
        <Table className="bg-secondary/50 mt-0 rounded-lg">
          <TableBody>
            {recentBranches && recentBranches.length > 0 && (
              <TableRow>
                <TableCell className="p-3 font-semibold">Recent branches</TableCell>
              </TableRow>
            )}
            {recentBranches?.map((branch) => branchRow(branch, () => onSelectBranch(branch)))}
            {localBranches.length > 0 && (
              <TableRow>
                <TableCell className="p-3 font-semibold">Local branches</TableCell>
              </TableRow>
            )}
            {localBranches.map((branch) => branchRow(branch, () => onSelectBranch(branch)))}
            {remoteBranches.length > 0 && (
              <TableRow>
                <TableCell className="p-3 font-semibold">Remote branches</TableCell>
              </TableRow>
            )}
            {remoteBranches.map((branch) => branchRow(branch, () => onSelectBranch(branch)))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function branchRow(branch: string, onClick: () => void): ReactElement {
  return (
    <TableRow key={branch} className="cursor-pointer" onClick={onClick}>
      <TableCell className="flex gap-2 py-3">
        <GitBranch size={14} className="mt-1" /> {branch}
      </TableCell>
    </TableRow>
  )
}
