import { daysAgo, getCommitTags } from '@/Util'
import { ReactElement } from 'react'
import { DefaultLogFields, LogResult } from 'simple-git'
import { Badge } from '../shadcn/Badge'

interface RepoHistoryCommitListProps {
  log: LogResult<DefaultLogFields>
  selectedCommit: DefaultLogFields | null
  onSelectCommit: (commit: DefaultLogFields) => void
}

export default function RepoHistoryCommitList({ log, selectedCommit, onSelectCommit }: RepoHistoryCommitListProps): ReactElement {
  return (
    <>
      {log.all.map((commit: DefaultLogFields) => {
        const tags = getCommitTags(commit)
        return (
          <div
            key={commit.hash}
            onMouseDown={() => onSelectCommit(commit)}
            className={`p-1 pl-2 text-sm cursor-pointer ${commit.hash === selectedCommit?.hash ? 'bg-secondary' : 'hover:bg-secondary'}`}
          >
            <div className="font-semibold truncate">{commit.message}</div>
            <div className="text-muted-foreground text-xs">
              {commit.author_name} - {daysAgo(new Date(commit.date))}
            </div>
            {tags.length > 0 && (
              <div className="mt-1">
                {tags.map((tag) => (
                  <Badge key={tag} className="mr-1 max-w-[100%]">
                    <div className="truncate">{tag}</div>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
