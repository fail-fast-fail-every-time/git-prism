import useStore from '@/stores/store'
import { formatDate } from '@/Util'
import { Calendar, GitCommitHorizontal, User } from 'lucide-react'
import { ReactElement } from 'react'
import { DefaultLogFields } from 'simple-git'

interface RepoHistoryCommitDetailsProps {
  commit: DefaultLogFields
}

export default function RepoHistoryCommitDetails({ commit }: RepoHistoryCommitDetailsProps): ReactElement {
  const hourFormat = useStore((store) => store.settings.hourFormat)

  return (
    <div className="p-3 border-b text-sm">
      <div className="mb-1 text-base">{commit.message}</div>
      {commit.body?.length > 0 && <div className="mb-3 max-h-24 overflow-y-auto text-sm whitespace-pre-line">{commit.body}</div>}
      <div className="flex gap-8">
        <div className="flex gap-1">
          <User size={16} />
          <div>
            {commit.author_name} &lt;{commit.author_email}&gt;
          </div>
        </div>
        <div className="flex gap-1">
          <Calendar size={16} />
          <div>{formatDate(new Date(commit.date), hourFormat)}</div>
        </div>
        <div className="flex gap-1">
          <GitCommitHorizontal size={16} />
          <div>{commit.hash}</div>
        </div>
      </div>
    </div>
  )
}
