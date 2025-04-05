import { GitChangeType } from '@/models/Repository'
import { ReactElement } from 'react'
import { Badge } from './shadcn/Badge'

interface ChangeTypeBadgeProps {
  changeType: GitChangeType
}

export default function ChangeTypeBadge({ changeType }: ChangeTypeBadgeProps): ReactElement {
  const label = labels[changeType] ?? labels['modified']
  return <Badge variant="outline">{label}</Badge>
}

const labels = {
  modified: <span className="text-gray-600 text-xxs">modified</span>,
  added: <span className="text-green-600 text-xxs dark:text-green-700">added</span>,
  deleted: <span className="text-destructive text-xxs dark:text-red-700">deleted</span>,
  renamed: <span className="text-blue-600 text-xxs dark:text-blue-800">renamed</span>,
  conflicted: <span className="text-destructive text-xxs dark:text-red-700">Conflict</span>
}
