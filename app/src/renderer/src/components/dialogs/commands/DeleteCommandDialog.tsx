import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import useStore from '@/stores/store'
import { ReactElement } from 'react'
import { Button } from '../../shadcn/Button'

interface DeleteCommandDialogProps {
  onClose: () => void
  commandName: string
}

export default function DeleteCommandDialog({ onClose, commandName }: DeleteCommandDialogProps): ReactElement {
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
