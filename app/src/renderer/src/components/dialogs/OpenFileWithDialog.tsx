import { FormError, FormLabel } from '@/components/Forms'
import { Button } from '@/components/shadcn/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import { Input } from '@/components/shadcn/Input'
import ExternalEditor from '@/models/ExternalEditor'
import useStore from '@/stores/store'
import { ReactElement, useState } from 'react'

interface OpenFileWithDialogProps {
  onClose: () => void
}

//This dialog is shown when right-clicking on a file in the list of changed files in a repo and selecting "Open with..".
export default function OpenFileWithDialog({ onClose }: OpenFileWithDialogProps): ReactElement {
  const settings = useStore((state) => state.settings)
  const setSettings = useStore((state) => state.setSettings)
  const [executable, setExecutable] = useState<string | null>(null)
  const [executableName, setExecutableName] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | undefined>(undefined)

  async function addEditorAndOpenApp(): Promise<void> {
    if (!executable || !executableName) {
      setFormError('Please enter both executable and a name')
      return
    }

    //Add the new external editor to the list of external editors in the settings.
    const externalEditor = new ExternalEditor(executable, executableName)
    const newSettings = { ...settings, externalEditors: [...settings.externalEditors, externalEditor] }
    setSettings(newSettings)

    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Open file with external editor</DialogTitle>
          <DialogDescription>The name and path will be saved so this needs be done only once</DialogDescription>
        </DialogHeader>
        <FormLabel htmlFor="executable">Name or path of executable</FormLabel>
        <Input
          id="executable"
          placeholder="code.exe"
          onKeyDown={(e) => e.key == 'Enter' && addEditorAndOpenApp()}
          onChange={(e) => setExecutable(e.target.value)}
        />
        <FormLabel htmlFor="executableName">Name</FormLabel>
        <Input
          id="executableName"
          placeholder="Visual Studio Code"
          onKeyDown={(e) => e.key == 'Enter' && addEditorAndOpenApp()}
          onChange={(e) => setExecutableName(e.target.value)}
        />
        <FormError>{formError}</FormError>
        <DialogFooter>
          <Button variant={'outline'} type="submit" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={addEditorAndOpenApp}>
            Open file
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
