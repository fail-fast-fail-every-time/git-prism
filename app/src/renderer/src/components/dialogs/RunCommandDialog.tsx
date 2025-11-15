import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import { Input } from '@/components/shadcn/Input'
import CustomCommand from '@/models/CustomCommand'
import useStore, { useSelectedWorkspace } from '@/stores/store'
import { Pencil, Play, Terminal, Trash } from 'lucide-react'
import { ReactElement, useState } from 'react'
import { FormLabel } from '../Forms'
import { Button } from '../shadcn/Button'
import { Checkbox } from '../shadcn/checkbox'
import { Label } from '../shadcn/Label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../shadcn/Table'
import { Tooltip, TooltipContent, TooltipTrigger } from '../shadcn/Tooltip'

interface RunCommandDialogProps {
  onClose: () => void
}

export default function RunCommandDialog({ onClose }: RunCommandDialogProps): ReactElement {
  const [showNewCommandDialog, setShowNewCommandDialog] = useState<boolean>(false)
  const [editCommand, setEditCommand] = useState<CustomCommand | null>(null)
  const [deleteCommand, setDeleteCommand] = useState<string | null>(null)
  const customCommands = useStore((store) => store.customCommands)
  const runCustomCommand = useStore((store) => store.runCustomCommand)

  const runCommand = (cmd: CustomCommand): void => {
    runCustomCommand(cmd)
    onClose()
  }

  const sortedCustomCommands = customCommands.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="min-w-[600px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Custom commands</DialogTitle>
          <DialogDescription>
            Define a new custom command to run a specific command on multiple repositories with one click.
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="p-3 font-semibold">Custom commands</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCustomCommands.length === 0 && (
              <TableRow>
                <TableCell className="p-3">No custom commands created yet.</TableCell>
              </TableRow>
            )}
            {sortedCustomCommands.map((cmd) => (
              <TableRow key={cmd.name}>
                <TableCell className="flex items-center cursor-pointer" onClick={() => setEditCommand(cmd)}>
                  <Terminal className="flex-0" size={16} />
                  <div className="flex-1 pl-1">{cmd.name}</div>
                </TableCell>
                <TableCell className="gap-1 px-2 py-1 w-[150px] text-right">
                  <Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setDeleteCommand(cmd.name)}>
                        <Trash className="flex-0" size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete command</TooltipContent>
                  </Tooltip>
                  <Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditCommand(cmd)}>
                        <Pencil className="flex-0" size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit command</TooltipContent>
                  </Tooltip>
                  <Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => runCommand(cmd)}>
                        <Play className="flex-0" size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Run command</TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div>
          <Button onClick={() => setShowNewCommandDialog(true)}>Create command...</Button>
        </div>
        {editCommand && <EditCommandDialog command={editCommand} onClose={() => setEditCommand(null)} />}
        {deleteCommand && <ConfirmDeleteCommandDialog commandName={deleteCommand} onClose={() => setDeleteCommand(null)} />}
        {showNewCommandDialog && (
          <NewCommandDialog
            onClose={(newCommand: CustomCommand | undefined) => {
              setShowNewCommandDialog(false)
              if (newCommand) setEditCommand(newCommand)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface EditCommandDialogProps {
  onClose: () => void
  command: CustomCommand
}

function EditCommandDialog({ onClose, command }: EditCommandDialogProps): ReactElement {
  const selectedWorkspace = useSelectedWorkspace()
  const [tempCommand, setTempCommand] = useState<CustomCommand>(structuredClone(command))
  const saveCustomCommand = useStore((store) => store.saveCustomCommand)

  const setCommandText = (repoPath: string, text: string): void => {
    setTempCommand({
      ...tempCommand,
      commandPerRepo: {
        ...tempCommand.commandPerRepo,
        [repoPath]: text
      }
    })
  }

  const setName = (name: string): void => {
    setTempCommand({
      ...tempCommand,
      name
    })
  }

  const setPinToToolbar = (pin: boolean): void => {
    setTempCommand({
      ...tempCommand,
      pinToToolbar: pin
    })
  }

  const save = (): void => {
    saveCustomCommand(command.name, tempCommand)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="min-w-[1000px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit command</DialogTitle>
        </DialogHeader>

        <p>
          Name: <br />
          <Input value={tempCommand.name} onChange={(e) => setName(e.target.value)} />
        </p>
        <p>
          Pin to toolbar: <br />
          <Checkbox checked={tempCommand.pinToToolbar} onCheckedChange={setPinToToolbar} />
        </p>
        <p>
          Commands:
          {selectedWorkspace && (
            <div className="max-h-[50vh] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Repository</TableHead>
                    <TableHead>Command</TableHead>
                  </TableRow>
                  {selectedWorkspace.repositories.map((repo) => (
                    <TableRow key={repo.path}>
                      <TableCell>{repo.name}</TableCell>
                      <TableCell className="w-[70%]">
                        <Input
                          value={tempCommand.commandPerRepo[repo.path] ?? ''}
                          onChange={(e) => setCommandText(repo.path, e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableHeader>
              </Table>
            </div>
          )}
        </p>
        <DialogFooter>
          <Button variant={'outline'} type="submit" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={save}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ConfirmDeleteCommandDialogProps {
  onClose: () => void
  commandName: string
}
function ConfirmDeleteCommandDialog({ onClose, commandName }: ConfirmDeleteCommandDialogProps): ReactElement {
  const removeCustomCommand = useStore((store) => store.removeCustomCommand)
  const deleteCommand = (): void => {
    removeCustomCommand(commandName)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="min-w-[400px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Delete command</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the command <b>{commandName}?</b>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant={'outline'} type="submit" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={'destructive'} type="submit" onClick={deleteCommand}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface NewCommandDialogProps {
  onClose: (createdCommand: CustomCommand | undefined) => void
}
function NewCommandDialog({ onClose }: NewCommandDialogProps): ReactElement {
  const [commandName, setCommandName] = useState<string>('')
  const saveCustomCommand = useStore((store) => store.saveCustomCommand)

  const create = (): void => {
    if (commandName.trim().length === 0) {
      return
    }
    const newCommand: CustomCommand = {
      name: commandName,
      commandPerRepo: {}
    }
    saveCustomCommand(commandName, newCommand)
    onClose(newCommand)
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose(undefined)}>
      <DialogContent className="min-w-[400px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>New command</DialogTitle>
          <DialogDescription>Enter a name for the new custom command.</DialogDescription>
        </DialogHeader>
        <FormLabel htmlFor="commandName">Name</FormLabel>
        <Input id="commandName" value={commandName} onChange={(e) => setCommandName(e.target.value)} />
        <DialogFooter>
          <Button variant={'outline'} type="submit" onClick={() => onClose(undefined)}>
            Cancel
          </Button>
          <Button type="submit" onClick={create}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
