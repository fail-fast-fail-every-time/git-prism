import { Badge } from '@/components/shadcn/Badge'
import { TableCell, TableRow } from '@/components/shadcn/Table'
import { ExternalGitClient } from '@/models/ExternalGitClient'
import { HourFormat } from '@/models/HourFormat'
import Repository from '@/models/Repository'
import useStore from '@/stores/store'
import { daysAgo, formatDate } from '@/Util'
import {
  AppWindow,
  CircleX,
  Download,
  Ellipsis,
  Folder,
  GitGraph,
  GitMerge,
  GitPullRequestArrow,
  GitPullRequestCreate,
  RotateCw,
  Terminal,
  Upload
} from 'lucide-react'
import { ReactElement, useState } from 'react'
import { BehindAhead } from './BehindAhead'
import BranchSelector from './BranchSelector'
import CreateBranchDialog from './dialogs/CreateBranchDialog'
import MergeBranchDialog from './dialogs/MergeBranchDialog'
import MergeIntoDialog from './dialogs/MergeIntoDialog'
import RebaseDialog from './dialogs/RebaseDialog'
import RunCommandDialog from './dialogs/RunCommandDialog'
import SwitchBranchDialog from './dialogs/SwitchBranchDialog'
import RepositoryTableError from './RepositoryTableError'
import { Checkbox } from './shadcn/checkbox'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from './shadcn/context-menu'
import Spinner from './Spinner'

interface RepositoryTableRowProps {
  repository: Repository
  onClick: () => void
  processing: boolean
}

export default function RepositoryTableRow({ repository, processing, onClick }: RepositoryTableRowProps): ReactElement {
  const checkedRepos = useStore((store) => store.checkedRepos)
  const setGlobalError = useStore((store) => store.setGlobalError)
  const removeRepositoryFromSelectedWorkspace = useStore((store) => store.removeRepositoryFromSelectedWorkspace)
  const settings = useStore((store) => store.settings)
  const setCheckedRepos = useStore((store) => store.setCheckedRepos)
  const [showSwitchBranch, setShowSwitchBranch] = useState<boolean>(false)
  const [showCreateBranch, setShowCreateBranch] = useState<boolean>(false)
  const [showMergeBranch, setShowMergeBranch] = useState<boolean>(false)
  const [showMergeInto, setShowMergeInto] = useState<boolean>(false)
  const [showRebase, setShowRebase] = useState<boolean>(false)
  const [showRunCommand, setShowRunCommand] = useState<boolean>(false)
  const runCommand = useStore((store) => store.runCommandOnRepositories)

  const toggleRepo = (repoPath: string): void => {
    setCheckedRepos({ ...checkedRepos, [repoPath]: !checkedRepos[repoPath] })
  }

  //Trigger the context menu when left clicking on the meatball by manually emitting a mouseevent as if the user right clicked
  const showContextMenuOnLeftClick = (event): void => {
    const element = event.target
    const contextMenuEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: event.clientX,
      clientY: event.clientY
    })
    element.dispatchEvent(contextMenuEvent)
  }

  const openInExternalGitClient = (repoPath: string): void => {
    if (!settings.externalGitClient) {
      setGlobalError('No external has been defined yet. Go to settings to select external client')
      return
    }

    const launchCommands = {
      [ExternalGitClient.GitHubDesktop]: 'github {repositoryPath}',
      [ExternalGitClient.Custom]: settings.externalGitClientCustomCommand
    }

    let command = launchCommands[settings.externalGitClient]
    if (!command) {
      setGlobalError('No command define for ' + settings.externalGitClient)
      return
    }
    command = command.replace('{repositoryPath}', repoPath)

    window.api.io.exec(command, [])
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <TableRow className="repo-table cursor-pointer">
            <TableCell>
              <label className="p-2">
                <Checkbox
                  disabled={repository.disabled}
                  checked={checkedRepos[repository.path]}
                  onCheckedChange={() => toggleRepo(repository.path)}
                  className="mt-1"
                />
              </label>
            </TableCell>
            <TableCell onClick={onClick} className="w-[25%]">
              {repository.name}
            </TableCell>
            <TableCell onClick={onClick}>
              <div className="flex flex-wrap items-center">{repository.branch && <BranchSelector repo={repository} />}</div>
            </TableCell>
            <TableCell onClick={onClick}>{latestCommit(repository, settings.hourFormat)}</TableCell>
            <TableCell onClick={onClick}>{status(repository)}</TableCell>
            <TableCell onClick={onClick}>
              {repository.tracking && <BehindAhead behind={repository.behind ?? 0} ahead={repository.ahead ?? 0} />}
            </TableCell>
            <TableCell className="min-w-20">
              {processing && <Spinner />}
              {!processing && repository.lastError && <RepositoryTableError repo={repository} />}
            </TableCell>
            <TableCell>
              <Ellipsis size={20} onClick={showContextMenuOnLeftClick} />
            </TableCell>
          </TableRow>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem onClick={() => runCommand((r) => r.fetch(), [repository])}>
            <Download size={16} className="mr-2" /> Fetch
          </ContextMenuItem>
          <ContextMenuItem onClick={() => runCommand((r) => r.pull(), [repository])}>
            <Download size={16} className="mr-2" /> Pull
          </ContextMenuItem>
          <ContextMenuItem onClick={() => runCommand((r) => r.push(), [repository])}>
            <Upload size={16} className="mr-2" /> Push
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => setShowSwitchBranch(true)}>
            <GitMerge size={16} className="mr-2" /> Switch branch...
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setShowCreateBranch(true)}>
            <GitPullRequestCreate size={16} className="mr-2" /> New branch...
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setShowMergeBranch(true)}>
            <GitPullRequestArrow size={16} className="mr-2" /> Merge another branch into this...
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setShowMergeInto(true)}>
            <GitPullRequestArrow size={16} className="mr-2" /> Merge this branch into another...
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setShowRebase(true)}>
            <GitGraph size={16} className="mr-2" /> Rebase...
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => runCommand((r) => r.refresh(), [repository])}>
            <RotateCw size={16} className="mr-2" /> Refresh
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setShowRunCommand(true)}>
            <Terminal size={16} className="mr-2" /> Run command...
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => window.api.io.openFileExplorer(repository.path)}>
            <Folder size={16} className="mr-2" /> Open in file explorer
          </ContextMenuItem>
          <ContextMenuItem onClick={() => openInExternalGitClient(repository.path)}>
            <AppWindow size={16} className="mr-2" />{' '}
            {settings.externalGitClient && settings.externalGitClient != ExternalGitClient.Custom
              ? 'Open in ' + settings.externalGitClient
              : 'Open In External GIT Client'}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => removeRepositoryFromSelectedWorkspace(repository.path)}>
            <CircleX size={16} className="mr-2" /> Remove from workspace
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {showSwitchBranch && <SwitchBranchDialog repository={repository} onClose={() => setShowSwitchBranch(false)} />}
      {showCreateBranch && <CreateBranchDialog repository={repository} onClose={() => setShowCreateBranch(false)} />}
      {showMergeBranch && <MergeBranchDialog repository={repository} onClose={() => setShowMergeBranch(false)} />}
      {showMergeInto && <MergeIntoDialog repository={repository} onClose={() => setShowMergeInto(false)} />}
      {showRunCommand && <RunCommandDialog repository={repository} onClose={() => setShowRunCommand(false)} />}
      {showRebase && <RebaseDialog repository={repository} onClose={() => setShowRebase(false)} />}
    </>
  )
}

function latestCommit(repo: Repository, hourFormat: HourFormat): ReactElement {
  if (repo.latestCommitAuthor && repo.latestCommitDate) {
    return (
      <>
        <div className="whitespace-nowrap" title={formatDate(repo.latestCommitDate, hourFormat)}>
          {daysAgo(repo.latestCommitDate)}
        </div>
        <div className="text-foreground/60 whitespace-nowrap">By {repo.latestCommitAuthor}</div>
      </>
    )
  } else {
    return <></>
  }
}

function status(repo: Repository): ReactElement {
  return (
    <div className="flex gap-1">
      {repo.rebaseInProgress && <Badge variant="outline">Rebasing</Badge>}
      {repo.conflicts.length > 0 && <Badge variant={'destructive'}>{repo.conflicts.length} conflicts</Badge>}
      {repo.files.length > 0 && repo.conflicts.length == 0 && (
        <Badge variant={'default'} className="whitespace-nowrap">
          {repo.files.length} changes
        </Badge>
      )}
    </div>
  )
}
