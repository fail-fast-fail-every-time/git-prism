import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import { Input } from '@/components/shadcn/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/select'
import CustomCommand, { PinSetting } from '@/models/CustomCommand'
import useStore, { useSelectedWorkspace } from '@/stores/store'
import { ReactElement, useState } from 'react'
import { Button } from '../../shadcn/Button'
import { Label } from '../../shadcn/Label'

interface EditCommandDialogProps {
  onClose: () => void
  command: CustomCommand
}

export default function EditCommandDialog({ onClose, command }: EditCommandDialogProps): ReactElement {
  const selectedWorkspace = useSelectedWorkspace()
  const [tempCommand, setTempCommand] = useState<CustomCommand>(structuredClone(command))
  const saveCustomCommand = useStore((store) => store.saveCustomCommand)
  const workspaces = useStore((store) => store.workspaces)

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

  const setPinSetting = (pinSetting: PinSetting): void => {
    setTempCommand({
      ...tempCommand,
      pinSetting: pinSetting,
      pinToWorkspaceId: pinSetting === PinSetting.Workspace ? (tempCommand.pinToWorkspaceId ?? selectedWorkspace?.id ?? null) : null
    })
  }

  const setSelectedWorkspaceId = (workspaceId: string): void => {
    setTempCommand({
      ...tempCommand,
      pinToWorkspaceId: workspaceId
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

        <div className="flex flex-col">
          <div className="flex items-center p-3">
            <div className="w-[300px]">
              <Label className="font-semibold">Name</Label>
            </div>
            <div className="flex-1">
              <Input value={tempCommand.name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center p-3">
            <div className="w-[300px]">
              <Label className="font-semibold">Pin to toolbar</Label>
            </div>
            <div className="flex flex-1 gap-3 1">
              <Select defaultValue={tempCommand.pinSetting} onValueChange={setPinSetting}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PinSetting.AllWorkspaces}>Pin to toolbar in all workspaces</SelectItem>
                  <SelectItem value={PinSetting.Workspace}>Pin to toolbar in a specific workspace</SelectItem>
                  <SelectItem value={PinSetting.None}>Do not pin</SelectItem>
                </SelectContent>
              </Select>
              {tempCommand.pinSetting === PinSetting.Workspace && (
                <Select defaultValue={tempCommand.pinToWorkspaceId ?? selectedWorkspace?.id} onValueChange={setSelectedWorkspaceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map((workspace) => (
                      <SelectItem key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        <div className="border-t" />
        <div className="pl-3 text-sm">
          <div className="font-semibold">Commands</div>
          <div>
            Commands are specified separately for each repository. Commands are executed with the default shell (cmd.exe on windows). If you
            need to run multiple commands, separate them with <code>&amp;&amp;</code> (e.g. <code>git fetch && git pull</code>).
          </div>
        </div>
        {selectedWorkspace && (
          <div className="pl-3 max-h-[50vh] overflow-auto">
            <div className="flex flex-col">
              {selectedWorkspace.repositories.map((repo) => (
                <div key={repo.path} className="flex items-center p-3">
                  <div className="w-[300px]">
                    <Label>{repo.name}</Label>
                  </div>
                  <div className="flex-1">
                    <Input
                      value={tempCommand.commandPerRepo[repo.path] ?? ''}
                      onChange={(e) => setCommandText(repo.path, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
