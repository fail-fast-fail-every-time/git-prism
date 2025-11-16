import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import { Input } from '@/components/shadcn/Input'
import CustomCommand, { PinSetting } from '@/models/CustomCommand'
import useStore from '@/stores/store'
import { ReactElement, useState } from 'react'
import { FormLabel } from '../../Forms'
import { Button } from '../../shadcn/Button'

interface NewCommandDialogProps {
  onClose: (createdCommand: CustomCommand | undefined) => void
}
export default function NewCommandDialog({ onClose }: NewCommandDialogProps): ReactElement {
  const [commandName, setCommandName] = useState<string>('')
  const saveCustomCommand = useStore((store) => store.saveCustomCommand)

  const create = (): void => {
    if (commandName.trim().length === 0) {
      return
    }
    const newCommand: CustomCommand = {
      name: commandName,
      pinSetting: PinSetting.AllWorkspaces,
      pinToWorkspaceId: null,
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
