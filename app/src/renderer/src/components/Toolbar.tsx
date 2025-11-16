import SwitchBranchDialog from '@/components/dialogs/SwitchBranchDialog'
import { Button } from '@/components/shadcn/Button'
import useStore, { useSelectedWorkspace } from '@/stores/store'
import { Download, GitGraph, GitMerge, GitPullRequestArrow, GitPullRequestCreate, Terminal, Upload } from 'lucide-react'
import { ReactElement, useState } from 'react'
import Counter from './Counter'
import CreateBranchDialog from './dialogs/CreateBranchDialog'
import MergeBranchDialog from './dialogs/MergeBranchDialog'
import RebaseDialog from './dialogs/RebaseDialog'
import RunCommandDialog from './dialogs/commands/CommandListDialog'

export default function Toolbar(): ReactElement {
  const [showSwitchBranch, setShowSwitchBranch] = useState<boolean>(false)
  const [showCreateBranch, setShowCreateBranch] = useState<boolean>(false)
  const [showRunCommand, setShowRunCommand] = useState<boolean>(false)
  const [showMergeBranch, setShowMergeBranch] = useState<boolean>(false)
  const [showRebase, setShowRebase] = useState<boolean>(false)
  const runCommand = useStore((store) => store.runCommandOnRepositories)
  const runCustomCommand = useStore((store) => store.runCustomCommand)
  const customCommands = useStore((store) => store.customCommands)
  const workspace = useSelectedWorkspace()

  const fetch = async (): Promise<void> => {
    runCommand((repo) => repo.fetch())
  }

  const pull = async (): Promise<void> => {
    runCommand((repo) => repo.pull())
  }

  const push = async (): Promise<void> => {
    runCommand((repo) => repo.push())
  }

  const totalBehind = workspace?.repositories.reduce((acc, repo) => acc + (repo.behind ?? 0), 0) ?? 0
  const totalAhead = workspace?.repositories.reduce((acc, repo) => acc + (repo.ahead ?? 0), 0) ?? 0

  const customCommandsPinnedToToolbar = customCommands
    .filter((cmd) => cmd.pinToToolbar)
    .map((cmd) => ({
      text: cmd.name,
      component: Terminal,
      onClick: (): void => {
        runCustomCommand(cmd)
      }
    }))

  const toolbar = [
    {
      name: 'Sync',
      tools: [
        { text: 'Fetch', component: Download, onClick: fetch },
        { text: 'Pull', component: Download, onClick: pull, counter: totalBehind },
        { text: 'Push', component: Upload, onClick: push, counter: totalAhead }
      ]
    },
    {
      name: 'Banching',
      tools: [
        { text: 'Switch branch..', component: GitMerge, onClick: (): void => setShowSwitchBranch(true) },
        { text: 'New branch..', component: GitPullRequestCreate, onClick: (): void => setShowCreateBranch(true) },
        { text: 'Merge..', component: GitPullRequestArrow, onClick: (): void => setShowMergeBranch(true) },
        { text: 'Rebase..', component: GitGraph, onClick: (): void => setShowRebase(true) }
      ]
    },
    {
      name: 'Misc',
      tools: [{ text: 'Commands..', component: Terminal, onClick: (): void => setShowRunCommand(true) }, ...customCommandsPinnedToToolbar]
    }
  ]

  return (
    <div className="flex gap-2">
      {toolbar.map((toolsection) => (
        <div key={toolsection.name} className="flex flex-col flex-wrap items-center bg-secondary/50 my-3 rounded-lg">
          <div className="flex">
            {toolsection.tools.map((t) => (
              <Button key={t.text} variant={'ghost'} onClick={t.onClick} className="flex flex-col px-5 py-9 text-xs toolbar-button">
                <t.component />
                <div className="max-w-[100px] min-h-[16px] overflow-x-hidden whitespace-nowrap">{t.text}</div>
                {t.counter > 0 && <Counter count={t.counter} className="top-[7px] right-[7px]" />}
              </Button>
            ))}
          </div>
        </div>
      ))}
      {showSwitchBranch && <SwitchBranchDialog onClose={() => setShowSwitchBranch(false)} />}
      {showCreateBranch && <CreateBranchDialog onClose={() => setShowCreateBranch(false)} />}
      {showRunCommand && <RunCommandDialog onClose={() => setShowRunCommand(false)} />}
      {showMergeBranch && <MergeBranchDialog onClose={() => setShowMergeBranch(false)} />}
      {showRebase && <RebaseDialog onClose={() => setShowRebase(false)} />}
    </div>
  )
}
