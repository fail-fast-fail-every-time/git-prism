import AddWorkspaceDialog from '@/components/dialogs/AddWorkspaceDialog'
import { Button } from '@/components/shadcn/Button'
import { CirclePlus } from 'lucide-react'
import { ReactElement, useState } from 'react'

export default function AddWorkspaceButton(): ReactElement {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  return (
    <>
      <Button variant="menuGhost" className="gap-2 w-full text-xs" onClick={() => setShowCreateDialog(!showCreateDialog)}>
        <CirclePlus />
        Add workspace
      </Button>
      {showCreateDialog && <AddWorkspaceDialog onClose={() => setShowCreateDialog(!showCreateDialog)} />}
    </>
  )
}
