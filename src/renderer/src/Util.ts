import { DefaultLogFields, DiffResultNameStatusFile } from 'simple-git'
import { HourFormat } from './models/HourFormat'
import Repository, { GitChange, GitChangeType } from './models/Repository'

//Returns a flat list of distinct local branche names from all the specified repositories
export function getLocalBranchesFromRepositoryList(repositories: Repository[], includeRemoteBranches: boolean): string[] {
  let branchNames: string[] = repositories.flatMap((r) => getBranchList(r, includeRemoteBranches))
  branchNames = [...new Set(branchNames)]
  branchNames = branchNames.sort()

  return branchNames
}

export function getBranchList(repo: Repository, includeRemoteBranches: boolean): string[] {
  return repo.branches
    .filter((branch) => {
      if (branch.name.startsWith('remotes/') || branch.name.startsWith('origin/')) {
        if (!includeRemoteBranches) {
          return false
        }
        const branchNameWithoutRemote = branch.name.replace('remotes/origin/', '').replace('origin/', '')
        if (repo.branches.some((b) => b.name === branchNameWithoutRemote)) {
          return false
        }
      }
      return true
    })
    .map((branch) => (branch.name.startsWith('remotes/') ? branch.name.replace('remotes/', '') : branch.name))
}

export function formatDate(date: Date, hourFormat: HourFormat): string {
  const formattedDate = new Intl.DateTimeFormat('default', {
    hourCycle: hourFormat === HourFormat.Hour12 ? 'h12' : 'h23',
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
  return formattedDate
}

export function daysAgo(date1: Date): string {
  const diffDays = getDifferenceInDays(date1, new Date())
  const diffMinutes = getDifferenceInMinutes(date1, new Date())
  const diffHours = Math.round(diffMinutes / 60)

  if (diffMinutes === 0) {
    return 'Just now'
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`
  } else if (diffDays === 0) {
    return `${diffHours} hours ago`
  } else if (diffDays == 1) {
    return 'Yesterday'
  } else {
    return `${diffDays} days ago`
  }
}

export function getDifferenceInDays(date1: Date, date2: Date): number {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate())
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate())

  const diffInMs = Math.abs(d2.getTime() - d1.getTime())

  return Math.floor(diffInMs / (1000 * 60 * 60 * 24))
}

export function getDifferenceInMinutes(date1: Date, date2: Date): number {
  const diffInMs = Math.abs(date2.getTime() - date1.getTime())
  return Math.floor(diffInMs / (1000 * 60))
}

export function distinctBy(arr: any[], fieldSelector: (any) => any): any[] {
  return arr.filter((obj, index, self) => index === self.findIndex((t) => fieldSelector(t) === fieldSelector(obj)))
}

//Converts the type of change from the one provided by gitdiff-parser to our own GitChangeType. Done to
//match the type listed for each file in the (uncommited) changes tab.
export function diffTypeToChangeType(diffType: 'add' | 'delete' | 'modify' | 'rename' | 'copy'): GitChangeType {
  if (diffType === 'add') return GitChangeType.Added
  if (diffType === 'delete') return GitChangeType.Deleted
  if (diffType === 'rename') return GitChangeType.Renamed
  return GitChangeType.Modified
}

export function fileLogToChanges(files: DiffResultNameStatusFile[]): GitChange[] {
  return files.map((file) => {
    const status: GitChangeType = statusToChangeType(file.status)
    const filePath = file.file
    return new GitChange(status, filePath)
  })
}

const statusMap = {
  A: GitChangeType.Added,
  C: GitChangeType.Modified,
  D: GitChangeType.Deleted,
  R: GitChangeType.Renamed
}
function statusToChangeType(status: string | undefined): GitChangeType {
  if (status === undefined) {
    return GitChangeType.Modified
  }
  return statusMap[status] ?? GitChangeType.Modified
}

export function getCommitTags(commit: DefaultLogFields): string[] {
  const tags = commit.refs
    .split(', ')
    .filter((ref) => ref.startsWith('tag: '))
    .map((ref) => ref.replace('tag: ', ''))

  return tags
}
