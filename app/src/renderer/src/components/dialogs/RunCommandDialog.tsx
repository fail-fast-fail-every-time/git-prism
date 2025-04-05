import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import { Input } from '@/components/shadcn/Input'
import Repository from '@/models/Repository'
import useStore from '@/stores/store'
import { CircleX, Terminal } from 'lucide-react'
import { ReactElement, useState } from 'react'
import { Button } from '../shadcn/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../shadcn/Table'

interface RunCommandDialogProps {
  onClose: () => void
  repository?: Repository | undefined
}

export default function RunCommandDialog({ onClose, repository }: RunCommandDialogProps): ReactElement {
  const [command, setCommand] = useState<string>('')
  const recentCommands = useStore((store) => store.recentCommands)
  const addRecentCommand = useStore((store) => store.addRecentCommand)
  const removeRecentCommand = useStore((store) => store.removeRecentCommand)
  const runCommandOnRepos = useStore((store) => store.runCommandOnRepositories)

  const runCommand = (): void => {
    if (command.length === 0) {
      return
    }
    addRecentCommand(command)
    runCommandOnRepos((repo) => repo.runCommandRaw(command), repository ? [repository] : undefined)
    onClose()
  }

  const removeRecent = (commandToRemove: string): void => {
    removeRecentCommand(commandToRemove)
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Execute command</DialogTitle>
          <DialogDescription>
            Run a custom command on {repository ? <b>{repository.name}</b> : 'checked repositories'}. The command must start with `git`.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="git pull --rebase"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key == 'Enter' && runCommand()}
        />
        {recentCommands.length > 0 && (
          <div className="h-[300px] overflow-y-auto">
            <Table className="bg-secondary/50 mt-0 rounded-lg">
              <TableHeader>
                <TableRow>
                  <TableHead>Recent commmands</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCommands.map((recentCommand, index) => (
                  <TableRow key={index} className="cursor-pointer">
                    <TableCell className="flex gap-2" onClick={runCommand}>
                      <Terminal size={14} className="mt-1" /> {recentCommand}
                    </TableCell>
                    <TableCell className="w-16" onClick={() => removeRecent(recentCommand)}>
                      <CircleX size={14} className="mt-1" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <DialogFooter>
          <Button variant={'outline'} type="submit" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={() => runCommand}>
            Run command
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
