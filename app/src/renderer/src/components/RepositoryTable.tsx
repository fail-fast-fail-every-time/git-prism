import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/Table'
import Repository from '@/models/Repository'
import { useSelectedWorkspace } from '@/stores/store'
import { ReactElement } from 'react'
import RepositoryTableRow from './RepositoryTableRow'

interface RepositoryTableProps {
  reposProcessing: string[]
  onSelectRepo: (repo: Repository) => void
}

export default function RepositoryTable({ reposProcessing, onSelectRepo }: RepositoryTableProps): ReactElement {
  const selectedWorkspace = useSelectedWorkspace()
  const repositories = selectedWorkspace?.repositories.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Table className="mt-0 rounded-lg">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[20%]">Repository</TableHead>
          <TableHead className="w-[25%]">Branch</TableHead>
          <TableHead className="w-[15%]">Latest Commit</TableHead>
          <TableHead className="w-[10%]">Status</TableHead>
          <TableHead className="w-[10%] text-center text-nowrap">Behind | Ahead</TableHead>
          <TableHead className="w-[5%]"></TableHead>
          <TableHead className="w-[5%]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {repositories?.map((repo) => (
          <RepositoryTableRow
            onClick={() => onSelectRepo(repo)}
            key={repo.path}
            repository={repo}
            processing={reposProcessing.includes(repo.path)}
          />
        ))}
        {repositories?.length === 0 && (
          <TableRow>
            <TableCell colSpan={8}>
              <i>Click the `Add repositories` button to add repositories.</i>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
