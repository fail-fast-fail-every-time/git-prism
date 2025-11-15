import Repository from '@/models/Repository'
import useStore from '@/stores/store'
import { TriangleAlert, X } from 'lucide-react'
import { ReactElement } from 'react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './shadcn/hover-card'

interface RepositoryTableErrorProps {
  repo: Repository
}

export default function RepositoryTableError({ repo }: RepositoryTableErrorProps): ReactElement {
  const runCommand = useStore((store) => store.runCommandOnRepositories)

  const hideError = (): void => {
    runCommand(async (repo) => (repo.lastError = undefined), [repo], false)
  }

  return (
    <HoverCard openDelay={0} closeDelay={100}>
      <HoverCardTrigger asChild>
        <TriangleAlert size={20} color={'darkred'} />
      </HoverCardTrigger>
      <HoverCardContent side="left" className="w-[500px] cursor-default">
        <div className="float-right cursor-pointer" onClick={hideError}>
          <X size={16} />
        </div>
        <div className="font-semibold">Error:</div>
        <div className="font-mono break-words">&gt; {repo.lastError}</div>
      </HoverCardContent>
    </HoverCard>
  )
}
