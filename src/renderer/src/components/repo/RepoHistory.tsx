import Repository, { GitChange } from '@/models/Repository'
import { ReactElement, useEffect, useState } from 'react'
import { FileData, parseDiff } from 'react-diff-view'
import { DefaultLogFields, LogResult } from 'simple-git'
import FileDiff from '../FileDiff'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../shadcn/resizable'
import RepoHistoryCommitDetails from './RepoHistoryCommitDetails'
import RepoHistoryCommitFiles from './RepoHistoryCommitFiles'
import RepoHistoryCommitList from './RepoHistoryCommitList'

interface RepoHistoryProps {
  repo: Repository
}

export default function RepoHistory({ repo }: RepoHistoryProps): ReactElement {
  const [log, setLog] = useState<LogResult<DefaultLogFields> | null>(null)
  const [selectedCommit, setSelectedCommit] = useState<DefaultLogFields | null>(null)
  const [selectedFile, setSelectedFile] = useState<GitChange | null>(null)
  const [selectedFileDiff, setSelectedFileDiff] = useState<FileData | null>(null)

  useEffect(() => {
    repo.getLog({ n: 50 }).then((res: LogResult<DefaultLogFields>) => {
      setLog(res)
      setSelectedCommit(res.all[0])
    })
  }, [])

  const handleSelectFile = async (file: GitChange): Promise<void> => {
    setSelectedFile(file)
    if (selectedCommit) {
      const diff = await repo.show(selectedCommit.hash, ['-1', '--first-parent', '--format=', '--', file.filePath])
      const parsedDiff: FileData[] = parseDiff(diff)
      setSelectedFileDiff(parsedDiff[0])
    }
  }

  return (
    <>
      <ResizablePanelGroup direction="horizontal" className="border">
        <ResizablePanel className="divide-y !overflow-y-auto" defaultSize={22}>
          {log && (
            <RepoHistoryCommitList log={log} selectedCommit={selectedCommit} onSelectCommit={(commit) => setSelectedCommit(commit)} />
          )}
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <div className="flex flex-col h-full">
            {selectedCommit && <RepoHistoryCommitDetails commit={selectedCommit} />}
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel className="divide-y !overflow-y-auto" defaultSize={22}>
                {selectedCommit && (
                  <RepoHistoryCommitFiles
                    repo={repo}
                    commitHash={selectedCommit.hash}
                    selectedFile={selectedFile}
                    onSelectFile={handleSelectFile}
                  />
                )}
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel className="!overflow-y-auto" defaultSize={56}>
                {selectedFileDiff && <FileDiff repoBasePath={repo.path} diff={selectedFileDiff} />}
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  )
}
