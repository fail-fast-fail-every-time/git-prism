import ExternalEditor from './ExternalEditor'
import { ExternalGitClient } from './ExternalGitClient'
import { HourFormat } from './HourFormat'

export default class Settings {
  public appDataPath: string = './appData.json'
  public concurrency: number = 10
  public recentCommandsToSave: number = 10
  public periodicallyFetchEnabled: boolean = true
  public periodicallyFetchIntervalMinutes: number = 60
  public externalGitClient: ExternalGitClient | undefined
  public externalGitClientCustomCommand: string | undefined
  public hourFormat: HourFormat = HourFormat.Hour24
  public externalEditors: ExternalEditor[] = []

  public constructor(init?: Partial<Settings>) {
    Object.assign(this, init)
  }
}
