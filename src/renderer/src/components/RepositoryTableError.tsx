import { TriangleAlert } from 'lucide-react'
import { ReactElement } from 'react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './shadcn/hover-card'

interface RepositoryTableErrorProps {
  lastError: string
}

export default function RepositoryTableError({ lastError }: RepositoryTableErrorProps): ReactElement {
  return (
    <HoverCard openDelay={0} closeDelay={100}>
      <HoverCardTrigger asChild>
        <TriangleAlert size={20} color={'darkred'} />
      </HoverCardTrigger>
      <HoverCardContent side="left" className="w-[500px]">
        <div className="font-semibold">Error:</div>
        <div className="font-mono break-words">&gt; {lastError}</div>
      </HoverCardContent>
    </HoverCard>
  )
}
