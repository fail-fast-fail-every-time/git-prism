import { Button } from '@/components/shadcn/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import { ReactElement } from 'react'
import packageJson from '../../../../../package.json'

interface AboutDialog {
  onClose: () => void
}

export default function About({ onClose }: AboutDialog): ReactElement {
  const appVersion = packageJson.version

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>About</DialogTitle>
          <DialogDescription>
            <div className="flex">Git Prism</div>
            <div>Version: {appVersion}</div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
