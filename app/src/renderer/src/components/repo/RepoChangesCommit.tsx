import Repository, { GitChange } from '@/models/Repository'
import useStore from '@/stores/store'
import { ReactElement, useMemo, useState } from 'react'
import { Button } from '../shadcn/Button'
import { Textarea } from '../shadcn/textarea'
import Spinner from '../Spinner'

interface RepoChangesCommitProps {
  repo: Repository
  checkedFiles: Record<string, boolean>
  selectedFiles: GitChange[]
  setSelectedFiles: (files: GitChange[]) => void
}

export default function RepoChangesCommit({ repo, checkedFiles, selectedFiles, setSelectedFiles }: RepoChangesCommitProps): ReactElement {
  const [showCommitSpinner, setShowCommitSpinner] = useState<boolean>(false)
  const [showCommitAndPushSpinner, setShowCommitAndPushSpinner] = useState<boolean>(false)
  const [commitMessage, setCommitMessage] = useState<string>('')
  const setGlobalError = useStore((store) => store.setGlobalError)
  const runCommand = useStore((store) => store.runCommandOnRepositories)

  const commitPlaceholder = useMemo(() => {
    return commitMessagePlaceholders[Math.floor(Math.random() * commitMessagePlaceholders.length)]
  }, [])

  const allowCommit =
    commitMessage.length > 0 &&
    !showCommitSpinner &&
    !showCommitAndPushSpinner &&
    Object.values(checkedFiles).find((checked) => checked) !== undefined

  const commit = async (): Promise<void> => {
    setShowCommitSpinner(true)
    await commitSelectedFiles()
    setCommitMessage('')
    setShowCommitSpinner(false)
  }

  const commitAndPush = async (): Promise<void> => {
    setShowCommitAndPushSpinner(true)
    await commitSelectedFiles()
    await runCommand(() => repo.push(), [repo])
    if (repo.lastError) {
      setGlobalError('Unable to push commit: ' + repo.lastError)
    }
    setCommitMessage('')
    setShowCommitAndPushSpinner(false)
  }

  const commitSelectedFiles = async (): Promise<void> => {
    const fileNamesOfCheckedFiles = repo.changes.filter((change) => checkedFiles[change.filePath]).map((change) => change.filePath)
    if (fileNamesOfCheckedFiles.length > 0) {
      await runCommand(() => repo.add(fileNamesOfCheckedFiles), [repo])
      const merging = await repo.revParse('MERGE_HEAD')
      if (merging) {
        await runCommand(() => repo.commit(commitMessage), [repo])
      } else {
        await runCommand(() => repo.commit(commitMessage, fileNamesOfCheckedFiles), [repo])
      }
      //Reset selected files if they were part of the commit
      const newSelectedFiles = selectedFiles.filter((file) => !fileNamesOfCheckedFiles.includes(file.filePath))
      setSelectedFiles(newSelectedFiles)
    }
  }

  return (
    <div className="mt-5 border-t h-[200px]">
      <div className="p-2 font-semibold text-sm tracking-tight">Commit selected files</div>
      <div className="p-2">
        <Textarea
          disabled={showCommitSpinner || showCommitAndPushSpinner}
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder={commitPlaceholder}
        />
        <div className="flex flex-row-reverse gap-1 mt-2">
          <Button disabled={!allowCommit} variant="default" onClick={commit}>
            Commit {showCommitSpinner && <Spinner />}
          </Button>
          <Button disabled={!allowCommit} variant="default" onClick={commitAndPush}>
            Commit & push {showCommitAndPushSpinner && <Spinner />}
          </Button>
        </div>
      </div>
    </div>
  )
}

const commitMessagePlaceholders = [
  'Fixed the thing that broke the other thing.',
  'Commit messages are hard. This is one of them.',
  'The code works, but I don’t know why.',
  'It compiles. Ship it.',
  'Fixed a bug. Created two more.',
  'Refactored spaghetti into lasagna.',
  'Improved performance by disabling everything.'
]
