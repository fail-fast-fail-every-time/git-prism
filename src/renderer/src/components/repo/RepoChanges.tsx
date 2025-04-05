import Repository, { GitChange, GitChangeType } from '@/models/Repository'
import useStore from '@/stores/store'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import { FileData, parseDiff } from 'react-diff-view'
import FileDiff from '../FileDiff'
import { Button } from '../shadcn/Button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../shadcn/resizable'
import Spinner from '../Spinner'
import RepoChangesCommit from './RepoChangesCommit'
import RepoChangesFileList from './RepoChangesFileList'

interface RepoChangesProps {
  repo: Repository
}

export default function RepoChanges({ repo }: RepoChangesProps): ReactElement {
  const [selectedFileDiff, setSelectedFileDiff] = useState<FileData | null>(null)
  const [userCheckedFiles, setUserCheckedChanges] = useState<Record<string, boolean>>({})
  const changes = repo.changes
  const [selectedFiles, setSelectedFiles] = useState<GitChange[]>(changes.length > 0 ? [changes[0]] : [])
  const runCommand = useStore((store) => store.runCommandOnRepositories)

  useEffect(() => {
    if (selectedFiles.length === 1) {
      const getDiff = async (): Promise<void> => {
        let diff: string
        const selectedFile = selectedFiles[0]
        if (selectedFile.type === GitChangeType.Added) {
          diff = await repo.diff(['--no-index', '--', '/dev/null', selectedFile.filePath])
        } else {
          diff = await repo.diff(['HEAD', '--', selectedFile.filePath])
        }

        const parsedDiff: FileData[] = parseDiff(diff)
        setSelectedFileDiff(parsedDiff[0])
      }
      getDiff()
    } else {
      setSelectedFileDiff(null)
    }
  }, [selectedFiles, repo.lastStatus])

  const checkedFiles = useMemo(() => {
    const defaultChecked = changes.map((c) => [c.filePath, true])
    return { ...Object.fromEntries(defaultChecked), ...userCheckedFiles }
  }, [userCheckedFiles, changes.length])

  const toggleFile = (change: GitChange, checked: boolean): void => {
    setUserCheckedChanges({ ...userCheckedFiles, [change.filePath]: (userCheckedFiles[change.filePath] = checked) })
  }

  const toggleAllFiles = (checked: boolean): void => {
    setUserCheckedChanges(Object.fromEntries(changes.map((c) => [c.filePath, checked])))
  }

  const rebaseContinue = async (): Promise<void> => {
    return runCommand(
      async (repo) => {
        await repo.add(Object.keys(checkedFiles))
        if (!repo.lastError) {
          await repo.rebase(['--continue'])
        }
      },
      [repo]
    )
  }

  const rebaseAbort = async (): Promise<void> => {
    return runCommand((repo) => repo.rebase(['--abort']), [repo])
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="border">
      <ResizablePanel defaultSize={25} className="!overflow-y-auto">
        <RepoChangesFileList
          repo={repo}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          checkedFiles={checkedFiles}
          toggleFile={toggleFile}
          toggleAllFiles={toggleAllFiles}
        />
        {changes.length > 0 && !repo.rebaseInProgress && (
          <RepoChangesCommit repo={repo} checkedFiles={checkedFiles} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />
        )}
        {repo.rebaseInProgress && <RebaseButtons onContinue={rebaseContinue} onAbort={rebaseAbort} />}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={75} className="!overflow-y-auto">
        {selectedFiles.length === 1 && selectedFileDiff ? (
          <FileDiff repoBasePath={repo.path} diff={selectedFileDiff} />
        ) : (
          <div className="px-5 py-3 text-sm">{selectedFiles.length} files selected</div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

function RebaseButtons({ onContinue, onAbort }: { onContinue: () => Promise<void>; onAbort: () => Promise<void> }): ReactElement {
  const [showContinueSpinner, setShowContinueSpinner] = useState<boolean>(false)
  const [showAbortSpinner, setShowAbortSpinner] = useState<boolean>(false)

  const handleContinue = async (): Promise<void> => {
    setShowContinueSpinner(true)
    await onContinue()
    setShowContinueSpinner(false)
  }

  const handleAbort = async (): Promise<void> => {
    setShowAbortSpinner(true)
    await onAbort()
    setShowAbortSpinner(false)
  }

  return (
    <div className="mt-5 p-2 border-t h-[200px] text-right">
      <Button onClick={handleAbort} variant="secondary" className="mr-1" disabled={showContinueSpinner || showAbortSpinner}>
        Abort rebase {showAbortSpinner && <Spinner />}
      </Button>
      <Button onClick={handleContinue} disabled={showContinueSpinner || showAbortSpinner}>
        Continue rebase {showContinueSpinner && <Spinner />}
      </Button>
    </div>
  )
}
