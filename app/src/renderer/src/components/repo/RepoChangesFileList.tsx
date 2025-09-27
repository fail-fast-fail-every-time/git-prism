import Repository, { GitChange } from '@/models/Repository'
import useStore from '@/stores/store'
import { ExternalLink, Folder, Trash } from 'lucide-react'
import { ReactElement, useEffect, useState } from 'react'
import ChangeTypeBadge from '../ChangeTypeBadge'
import DiscardFilesDialog from '../dialogs/DiscardFilesDialog'
import OpenFileWithDialog from '../dialogs/OpenFileWithDialog'
import ResponsiveFilePath from '../ResponsiveFilePath'
import { Checkbox } from '../shadcn/checkbox'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../shadcn/context-menu'

interface RepoChangesFileListProps {
  repo: Repository
  selectedFiles: GitChange[]
  checkedFiles: Record<string, boolean>
  setSelectedFiles: (files: GitChange[]) => void
  toggleAllFiles: (checked: boolean) => void
  toggleFile: (change: GitChange, checked: boolean) => void
}

export default function RepoChangesFileList({
  repo,
  selectedFiles,
  checkedFiles,
  setSelectedFiles,
  toggleAllFiles,
  toggleFile
}: RepoChangesFileListProps): ReactElement {
  const setGlobalError = useStore((store) => store.setGlobalError)
  const externalEditors = useStore((store) => store.settings.externalEditors)
  const [showOpenFileWithDialog, setShowOpenFileWithDialog] = useState<boolean>(false)
  const settings = useStore((state) => state.settings)
  const setSettings = useStore((state) => state.setSettings)
  const [showDiscardDialog, setShowDiscardDialog] = useState<boolean>(false)

  const changes = repo.changes
  changes.sort((a, b) => a.filePath.localeCompare(b.filePath))

  const openFileInExternalEditor = async (executable: string, filePath: string): Promise<void> => {
    const success = await window.api.io.exec(executable, [`${repo.path}/${filePath}`])
    if (!success) {
      setGlobalError('Not able to execute command: ' + executable)
    }
  }

  const removeExternalEditor = (name: string): void => {
    const newSettings = { ...settings, externalEditors: settings.externalEditors.filter((editor) => editor.name != name) }
    setSettings(newSettings)
  }

  const handleChangeClicked = (event, change: GitChange): void => {
    //React to left click
    if (event.button === 0) {
      if (event.shiftKey) {
        //Range select when shift is pressed
        const lastSelectedFile = selectedFiles[selectedFiles.length - 1]
        if (lastSelectedFile) {
          const lastIndex = changes.findIndex((c) => c.filePath === lastSelectedFile.filePath)
          const currentIndex = changes.findIndex((c) => c.filePath === change.filePath)
          const start = Math.min(lastIndex, currentIndex)
          const end = Math.max(lastIndex, currentIndex)
          setSelectedFiles([...new Set([...selectedFiles, ...changes.slice(start, end + 1)])])
        } else {
          setSelectedFiles([change])
        }
      } else if (event.ctrlKey) {
        //Add to selection when ctrl is pressed
        setSelectedFiles([...selectedFiles, change])
      } else {
        //Single select
        setSelectedFiles([change])
      }
    }
  }

  const handleKeyDown = (event: KeyboardEvent): void => {
    //Select all files when pressing Ctrl+A
    //Only handle Ctrl+A if the active element is not a textarea or input
    if (
      event.ctrlKey &&
      event.key === 'a' &&
      !(document.activeElement instanceof HTMLTextAreaElement || document.activeElement instanceof HTMLInputElement)
    ) {
      event.preventDefault()
      setSelectedFiles(changes)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return (): void => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [changes])

  return (
    <div className="flex flex-col overflow-y-auto">
      <div className="flex gap-2 p-2 text-sm tracking-tight">
        <Checkbox onCheckedChange={toggleAllFiles} checked={changes.every((c) => checkedFiles[c.filePath] === true)} />
        <div className="font-semibold">Changed files</div>
      </div>
      <div className="mb-2 select-none">
        {changes.map((change: GitChange) => {
          const isSelected = selectedFiles.some((c) => c.filePath == change.filePath)
          return (
            <ContextMenu key={change.filePath}>
              <ContextMenuTrigger asChild>
                <div
                  className={`flex px-2 py-1 border-t text-sm cursor-pointer ${isSelected ? 'bg-secondary' : 'hover:bg-secondary'}`}
                  onMouseDown={(event) => handleChangeClicked(event, change)}
                >
                  <Checkbox
                    className="mr-2"
                    checked={checkedFiles[change.filePath]}
                    onCheckedChange={(checked: boolean) => toggleFile(change, checked)}
                  />
                  <ResponsiveFilePath filePath={change.filePath} />
                  <div className="ml-3">
                    <ChangeTypeBadge changeType={change.type} />
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-64">
                <ContextMenuItem onClick={() => setShowDiscardDialog(true)}>
                  <Trash size={16} className="mr-2" /> Discard changes in {selectedFiles.length} files...
                </ContextMenuItem>
                <ContextMenuItem onClick={() => window.api.io.openFileExplorer(window.api.io.joinPaths(repo.path, change.directoryPath))}>
                  <Folder size={16} className="mr-2" /> Show in file explorer
                </ContextMenuItem>
                <ContextMenuItem onClick={() => setShowOpenFileWithDialog(true)}>
                  <ExternalLink size={16} className="mr-2" /> Open with...
                </ContextMenuItem>
                {externalEditors.map((editor, idx) => (
                  <ContextMenuItem key={idx} className="flex">
                    <div className="flex-grow -m-2 p-2" onClick={() => openFileInExternalEditor(editor.executable, change.filePath)}>
                      <ExternalLink size={16} className="inline-block mr-2" /> Open with {editor.name}
                    </div>
                    <div
                      className="-m-2 px-1 py-2"
                      onClick={() => {
                        removeExternalEditor(editor.name)
                      }}
                    >
                      <Trash size={16} />
                    </div>
                  </ContextMenuItem>
                ))}
              </ContextMenuContent>
            </ContextMenu>
          )
        })}
        {changes.length == 0 && <div className="px-2 text-sm italic">No changed Files</div>}
        {showOpenFileWithDialog && <OpenFileWithDialog onClose={() => setShowOpenFileWithDialog(false)} />}
        {showDiscardDialog && selectedFiles.length > 0 && (
          <DiscardFilesDialog
            onClose={() => setShowDiscardDialog(false)}
            onFilesDiscarded={() => setSelectedFiles([])}
            repo={repo}
            changes={selectedFiles}
          />
        )}
      </div>
    </div>
  )
}
