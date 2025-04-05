import Repository from '@/models/Repository'
import Settings from '@/models/Settings'
import Workspace from '@/models/Workspace'
import { StoreState } from '@/stores/store'

//Filename of the file that is used to store the app data
//This file is stored in the current directory of the app
const APPDATA_FILENAME = 'appData.json'

//Structure of the data that is saved to the file system
interface AppDataFile {
  settings: Settings
  recentCommands: string[]
  recentBranches: Record<string, string[]>
  reposLastFetched: Date
  workspaces: {
    name: string
    selected: boolean
    repositories: {
      name: string
      path: string
    }[]
  }[]
}

function saveStoreToFile(state: StoreState): void {
  const appData: AppDataFile = convertStoreStateToAppData(state)
  const appDataJson = JSON.stringify(appData, null, 2)
  window.api.io.saveFile(APPDATA_FILENAME, appDataJson)
}

async function loadStoreFromFile(): Promise<Partial<StoreState>> {
  console.log('Load appdata from file system')

  //Check if file exists
  const fileExists = await window.api.io.fileExists(APPDATA_FILENAME)
  if (!fileExists) {
    console.log('File ' + APPDATA_FILENAME + ' does not exist yet')
    return {}
  }

  //Pull the content from the file system
  const fileContent = await window.api.io.loadFile(APPDATA_FILENAME)
  console.log('Loaded appdata from filesystem: ' + fileContent)

  //Deserializa file content and map data to StoreState object
  const appData = JSON.parse(fileContent) as AppDataFile

  const workspaces = appData.workspaces.map(
    (workspace) =>
      new Workspace(
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
    workspaces
  }
}

function convertStoreStateToAppData(state: StoreState): AppDataFile {
  const appData: AppDataFile = {
    settings: state.settings,
    recentCommands: state.recentCommands,
    recentBranches: state.recentBranchesPerRepo,
    reposLastFetched: state.reposLastFetched,
    workspaces: state.workspaces.map((workspace: Workspace) => {
      return {
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

