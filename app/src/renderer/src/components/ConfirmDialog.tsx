import { ReactElement } from 'react'
import { Button } from './shadcn/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './shadcn/Dialog'

interface ConfirmDialogProps {
  text: string
  title?: string
  onCancel: () => void
  onConfirm: () => void
}

export default function ConfirmDialog({ text, title, onCancel, onConfirm }: ConfirmDialogProps): ReactElement {
  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="mb-2">{title ?? 'Confirm'}</DialogTitle>
          <DialogDescription dangerouslySetInnerHTML={{ __html: text }}></DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant={'outline'} type="submit" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
