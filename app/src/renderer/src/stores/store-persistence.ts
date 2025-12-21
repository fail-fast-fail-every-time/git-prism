import CustomCommand from '@/models/CustomCommand'
import Repository from '@/models/Repository'
import Settings from '@/models/Settings'
import Workspace from '@/models/Workspace'
import { StoreState } from '@/stores/store'

//Structure of the data that is saved to the file system
interface AppDataFile {
  settings: Settings
  recentCommands: string[]
  recentBranches: Record<string, string[]>
  reposLastFetched: Date
  diffViewType?: 'unified' | 'split'
  customCommands?: CustomCommand[]
  workspaces: {
    id: string
    name: string
    selected: boolean
    repositories: {
      name: string
      path: string
    }[]
  }[]
}

function saveStoreToFile(appDataPath: string, state: StoreState): void {
  console.log('Save appdata to file system', appDataPath)
  const appData: AppDataFile = convertStoreStateToAppData(state)
  const appDataJson = JSON.stringify(appData, null, 2)
  window.api.io.saveFile(appDataPath, appDataJson)
}

async function loadStoreFromFile(appDataPath: string): Promise<Partial<StoreState>> {
  console.log('Load appdata from file system')

  //Check if file exists
  const fileExists = await window.api.io.fileExists(appDataPath)
  if (!fileExists) {
    console.log('File ' + appDataPath + ' does not exist yet')
    return {}
  }

  //Pull the content from the file system
  const fileContent = await window.api.io.loadFile(appDataPath)
  console.log('Loaded appdata from filesystem: ' + fileContent)

  //Deserialize file content and map data to StoreState object
  const appData = JSON.parse(fileContent) as AppDataFile

  const workspaces = appData.workspaces.map(
    (workspace) =>
      new Workspace(
        workspace.id ?? crypto.randomUUID(),
        workspace.name,
        workspace.repositories.map((repo) => new Repository(repo.name, repo.path)),
        workspace.selected
      )
  )

  return {
    settings: new Settings(appData.settings),
    recentCommands: appData.recentCommands ?? [],
    recentBranchesPerRepo: appData.recentBranches ?? {},
    reposLastFetched: appData.reposLastFetched,
    diffViewType: appData.diffViewType ?? 'unified',
    customCommands: appData.customCommands ?? [],
    workspaces
  }
}

function convertStoreStateToAppData(state: StoreState): AppDataFile {
  const appData: AppDataFile = {
    settings: state.settings,
    recentCommands: state.recentCommands,
    recentBranches: state.recentBranchesPerRepo,
    reposLastFetched: state.reposLastFetched,
    diffViewType: state.diffViewType,
    customCommands: state.customCommands,
    workspaces: state.workspaces.map((workspace: Workspace) => {
      return {
        id: workspace.id,
        name: workspace.name,
        selected: workspace.selected,
        repositories: workspace.repositories.map((repo: Repository) => {
          return {
            name: repo.name,
            path: repo.path
          }
        })
      }
    })
  }
  return appData
}

export { loadStoreFromFile, saveStoreToFile }

