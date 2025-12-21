import { FormError } from '@/components/Forms'
import { Button } from '@/components/shadcn/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/shadcn/Dialog'
import { Input } from '@/components/shadcn/Input'
import { ExternalGitClient } from '@/models/ExternalGitClient'
import { HourFormat } from '@/models/HourFormat'
import useStore from '@/stores/store'
import { ReactElement, useState } from 'react'
import { Label } from '../shadcn/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../shadcn/select'
import { Switch } from '../shadcn/Switch'

interface SettingsDialogProps {
  onClose: () => void
}

export default function SettingsDialog({ onClose }: SettingsDialogProps): ReactElement {
  const existingSettings = useStore((state) => state.settings)
  const setSettingsInStore = useStore((state) => state.setSettings)
  const [settings, setSettings] = useState({ ...existingSettings })
  const [formError, setFormError] = useState<string | undefined>(undefined)

  const save = (): void => {
    if (validateForm()) {
      setSettingsInStore(settings)
      onClose()
    }
  }

  const validateForm = (): boolean => {
    setFormError(undefined)
    if (settings.appDataPath.length == 0) {
      setFormError('App data file path must be provided.')
      return false
    }
    if (!settings.concurrency || settings.concurrency < 1) {
      setFormError('Concurrency must be at least 1.')
      return false
    }
    if (!settings.periodicallyFetchIntervalMinutes || settings.periodicallyFetchIntervalMinutes <= 0) {
      setFormError('Fetch interval must be greater than 0.')
      return false
    }
    if (settings.externalGitClient == ExternalGitClient.Custom && (settings.externalGitClientCustomCommand ?? '').length == 0) {
      setFormError('Please enter a command to launch the external GIT client.')
      return false
    }
    return true
  }

  const settingsFields = [
    {
      label: 'App data file path',
      description:
        'The location where the app data file is stored. This file contains the list of workspaces, repositories, and various settings.',
      input: <Input id="appDataPath" defaultValue={settings.appDataPath} onChange={(e) => (settings.appDataPath = e.target.value)} />
    },
    {
      label: 'Concurrency',
      description: 'Maximum number of GIT commands to execute in parallel.',
      input: (
        <Input
          className="w-40"
          id="concurrency"
          type="number"
          min="1"
          defaultValue={settings.concurrency}
          onChange={(e) => (settings.concurrency = parseInt(e.target.value))}
        />
      )
    },
    {
      label: 'External git client',
      description: 'Specifies which GIT client to open when using the "Open in external client" option from the repository context menu.',
      input: (
        <>
          <Select
            defaultValue={settings.externalGitClient}
            onValueChange={(val: ExternalGitClient) =>
              setSettings({ ...settings, externalGitClient: val, externalGitClientCustomCommand: undefined })
            }
          >
            <SelectTrigger className="">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ExternalGitClient.GitHubDesktop}>GitHub Desktop</SelectItem>
              <SelectItem value={ExternalGitClient.Custom}>Custom</SelectItem>
            </SelectContent>
          </Select>
          {settings.externalGitClient === ExternalGitClient.Custom && (
            <Input
              placeholder="gitclient.exe -r {repositoryPath}"
              defaultValue={settings.externalGitClientCustomCommand}
              onChange={(e) => (settings.externalGitClientCustomCommand = e.target.value)}
            />
          )}
        </>
      )
    },
    {
      label: 'Hour format',
      description: 'Choose between 24-hour format or 12-hour format (AM/PM) for commit dates.',
      input: (
        <Select defaultValue={settings.hourFormat} onValueChange={(val: HourFormat) => setSettings({ ...settings, hourFormat: val })}>
          <SelectTrigger className="">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Hour12">12-hour format</SelectItem>
            <SelectItem value="Hour24">24-hour format</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      label: 'Periodically fetch all repositories',
      description: 'Enable to fetch repositories in the background at regular intervals. If disabled, manual fetch is required.',
      input: (
        <Switch
          checked={settings.periodicallyFetchEnabled}
          onCheckedChange={(checked) => setSettings({ ...settings, periodicallyFetchEnabled: checked })}
        />
      )
    },
    {
      label: 'Auto update',
      description: 'When a new version of the app is available, automatically download and install the update.',
      input: (
        <Switch
          checked={settings.autoUpdateEnabled}
          onCheckedChange={(checked) => setSettings({ ...settings, autoUpdateEnabled: checked })}
        />
      )
    },
    {
      label: 'Periodically fetch interval (minutes)',
      description: 'Interval in minutes for fetching all repositories when periodic fetch is enabled.',
      show: settings.periodicallyFetchEnabled,
      input: (
        <Input
          className="w-40"
          id="periodically_fetch_interval"
          type="number"
          min="1"
          defaultValue={settings.periodicallyFetchIntervalMinutes}
          onChange={(e) => (settings.periodicallyFetchIntervalMinutes = parseInt(e.target.value))}
        />
      )
    }
  ]

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="min-w-[800px] h-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="mb-2">Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col mt-2 mb-4 divide-y divide-primary/20 overflow-y-auto">
          {settingsFields
            .filter((field) => field.show !== false)
            .map((field) => (
              <div key={field.label}>
                <div className={`grid grid-rows-[auto] grid-cols-[50%_50%]`}>
                  <div className="pt-4 pr-10 pb-6">
                    <Label className="font-semibold">{field.label}</Label>
                    <div className="text-sm">{field.description}</div>
                  </div>
                  <div className="flex flex-col gap-2 pt-5 pr-5 pb-6">{field.input}</div>
                </div>
              </div>
            ))}
        </div>
        <FormError>{formError}</FormError>
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
