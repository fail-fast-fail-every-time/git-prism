import Repository, { GitChange } from '@/models/Repository'
import { fileLogToChanges } from '@/Util'
import { ReactElement, useEffect, useState } from 'react'
import { DiffResultNameStatusFile } from 'simple-git'
import ChangeTypeBadge from '../ChangeTypeBadge'
import ResponsiveFilePath from '../ResponsiveFilePath'

interface RepoHistoryCommitFilesProps {
  repo: Repository
  commitHash: string
  selectedFile: GitChange | null
  onSelectFile: (file: GitChange) => void
}

export default function RepoHistoryCommitFiles({
  repo,
  commitHash,
  selectedFile,
  onSelectFile
}: RepoHistoryCommitFilesProps): ReactElement {
  const [changedFiles, setChangedFiles] = useState<GitChange[] | null>(null)

  useEffect(() => {
    async function loadChangedFiles(): Promise<void> {
      const log = await repo.getLog({ [commitHash]: null, '--name-status': null, '-1': null, '--first-parent': null })
      const logFiles = log.all[0]?.diff?.files as DiffResultNameStatusFile[]
      if (logFiles) {
        const filesParsed = fileLogToChanges(logFiles)
        setChangedFiles(filesParsed)
        onSelectFile(filesParsed[0])
      }
    }
    loadChangedFiles()
  }, [commitHash])

  return (
    <>
      {changedFiles &&
        changedFiles.map((file: GitChange) => (
          <div
            key={file.filePath}
            className={`py-1 pl-2 flex relative cursor-pointer text-sm ${file.filePath == selectedFile?.filePath ? 'bg-secondary' : 'hover:bg-secondary'}`}
            onMouseDown={(event) => event.button === 0 && onSelectFile(file)}
          >
            <ResponsiveFilePath filePath={file.filePath} />
            <div className="mr-1 ml-3">
              <ChangeTypeBadge changeType={file.type} />
            </div>
          </div>
        ))}
    </>
  )
}
