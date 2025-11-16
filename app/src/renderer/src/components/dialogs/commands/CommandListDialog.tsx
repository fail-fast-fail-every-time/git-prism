import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import CustomCommand from '@/models/CustomCommand'
import useStore from '@/stores/store'
import { Pencil, Play, Terminal, Trash } from 'lucide-react'
import { ReactElement, useState } from 'react'
import { Button } from '../../shadcn/Button'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../shadcn/Table'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../shadcn/Tooltip'
import DeleteCommandDialog from './DeleteCommandDialog'
import EditCommandDialog from './EditCommandDialog'
import NewCommandDialog from './NewCommandDialog'

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
        {deleteCommand && <DeleteCommandDialog commandName={deleteCommand} onClose={() => setDeleteCommand(null)} />}
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
