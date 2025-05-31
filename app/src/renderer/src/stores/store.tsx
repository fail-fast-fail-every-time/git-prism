import { RepositoryCommand } from '@/components/WorkspaceView'
import Repository from '@/models/Repository'
import Settings from '@/models/Settings'
import Workspace from '@/models/Workspace'
import { loadStoreFromFile, saveStoreToFile } from '@/stores/store-persistence'
import pLimit from 'p-limit'
import { create } from 'zustand'

export interface StoreState {
  initialized: boolean
  settings: Settings
  workspaces: Workspace[]
  globalError: string | undefined
  checkedRepos: Record<string, boolean>
  recentCommands: string[]
  reposLastFetched: Date
  reposProcessing: string[]
  recentBranchesPerRepo: Record<string, string[]>
  diffViewType: 'split' | 'unified'
  initialize: () => void
  persist: () => void
  setSettings: (settings: Settings) => void
  setReposLastFetched: (date: Date) => void
  addRecentCommand: (command: string) => void
  removeRecentCommand: (command: string) => void
  setCheckedRepos: (checkedRepos: Record<string, boolean>) => void
  addRepositories: (workspace: Workspace, repos: Repository[]) => void
  addRecentBranch: (repoPath: string, branch: string) => void
  updateRepository: (workspace: Workspace, repos: Repository) => void
  removeRepositoryFromSelectedWorkspace: (repoPath: string) => void
  setGlobalError: (text: string | undefined) => void
  addWorkspace: (workspace: Workspace) => void
  setSelectedWorkspace: (workspaceName: string) => void
  renameWorkspace: (oldName: string, newName: string) => void
  deleteWorkspace: (workspaceName: string) => void
  runCommandOnRepositories: (command: RepositoryCommand, reposToRunOn?: Repository[], showSpinner?: boolean) => Promise<void>
  getSelectedWorkspace: () => Workspace | undefined
  setDiffViewType: (viewType: 'split' | 'unified') => void
}

export const useStore = create<StoreState>()((set, get) => ({
  initialized: false,
  settings: new Settings(),
  workspaces: [new Workspace('Default workspace', [], true)],
  globalError: undefined,
  checkedRepos: {},
  recentCommands: [],
  reposLastFetched: new Date(),
  reposProcessing: [],
  recentBranchesPerRepo: {},
  diffViewType: 'unified',
  setSettings: (settings: Settings): void => {
    set(() => ({
      settings: settings
    }))
    get().persist()
  },
  setDiffViewType: (viewType: 'split' | 'unified'): void => {
    set(() => ({
      diffViewType: viewType
    }))
    get().persist()
  },
  setReposLastFetched: (date: Date): void => {
    set(() => ({
      reposLastFetched: date
    }))
    get().persist()
  },
  addRecentCommand: (command: string): void => {
    set((state) => {
      const filteredCommands = state.recentCommands.filter((c) => c !== command)
      return {
        recentCommands: [command, ...filteredCommands].slice(0, state.settings.recentCommandsToSave)
      }
    })
    get().persist()
  },
  removeRecentCommand: (command: string): void => {
    set((state) => ({
      recentCommands: state.recentCommands.filter((c) => c !== command)
    }))
    get().persist()
  },
  setCheckedRepos: (checkedRepos: Record<string, boolean>): void => {
    set(() => ({
      checkedRepos: checkedRepos
    }))
  },
  addRecentBranch: (repoPath: string, branch: string): void => {
    set((state) => {
      const recentBranches = state.recentBranchesPerRepo[repoPath] ?? []
      const filteredBranches = recentBranches.filter((b) => b !== branch)
      return {
        recentBranchesPerRepo: {
          ...state.recentBranchesPerRepo,
          [repoPath]: [branch, ...filteredBranches].slice(0, 5)
        }
      }
    })
    get().persist()
  },
  setSelectedWorkspace: (workspaceName: string): void => {
    const selectedWorkspace = get().workspaces.find((w) => w.name === workspaceName)
    if (!selectedWorkspace) {
      return
    }

    set((state) => ({
      workspaces: state.workspaces.map((w) => ({ ...w, selected: w.name == workspaceName })),
      checkedRepos: Object.fromEntries(selectedWorkspace.repositories.map((r) => [r.path, true]))
    }))
    get().persist()
    get().runCommandOnRepositories((repo) => repo.refresh(), selectedWorkspace?.repositories)
  },
  setGlobalError: (error: string | undefined): void => {
    set(() => ({ globalError: error }))
  },
  addWorkspace: (workspace: Workspace): void => {
    set((state) => ({
      workspaces: [...state.workspaces, workspace].map((w) => ({ ...w, selected: w.name == workspace.name }))
    }))
    get().persist()
  },
  renameWorkspace: (oldName: string, newName: string): void => {
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w.name == oldName ? { ...w, name: newName } : w))
    }))
    get().persist()
  },
  deleteWorkspace: (workspaceName: string): void => {
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w.name != workspaceName)
    }))
    get().persist()
  },
  addRepositories: (workspace: Workspace, repos: Repository[]): void => {
    set((state) => {
      const existingRepos = new Set(workspace.repositories.map((r) => r.path))
      const newRepos = repos.filter((r) => !existingRepos.has(r.path))
      return {
        workspaces: state.workspaces.map((w) => (w.name == workspace.name ? { ...w, repositories: [...w.repositories, ...newRepos] } : w)),
        checkedRepos: {
          ...state.checkedRepos,
          ...Object.fromEntries(newRepos.map((r) => [r.path, true]))
        }
      }
    })
    get().runCommandOnRepositories((repo) => repo.refresh(), repos)
    get().persist()
  },
  updateRepository: (workspace: Workspace, repo: Repository): void => {
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.name == workspace.name ? { ...w, repositories: w.repositories.map((r) => (r.path === repo.path ? repo : r)) } : w
      )
    }))
  },
  removeRepositoryFromSelectedWorkspace: (repoPath: string): void => {
    const selectedWorkspace = get().getSelectedWorkspace()
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.name == selectedWorkspace?.name ? { ...w, repositories: w.repositories.filter((r) => r.path != repoPath) } : w
      )
    }))
    get().persist()
  },
  runCommandOnRepositories: async (
    command: RepositoryCommand,
    reposToRunOn?: Repository[] | undefined,
    showSpinner: boolean = true
  ): Promise<void> => {
    const workspace = get().workspaces.find((w) => w.selected)
    if (!workspace) {
      console.log('not found')
      return
    }
    //If the list of repositories to run the command on is not provided, run on all checked repositories
    const repos = reposToRunOn ?? workspace.repositories.filter((r) => get().checkedRepos[r.path])

    //Clear all errors
    repos.forEach((r) => (r.lastError = undefined))

    //List all repositories as processing
    if (showSpinner) {
      set(() => ({
        reposProcessing: repos.map((repo) => repo.path)
      }))
    }

    //Make a list of promises one for each repository
    const limit = pLimit(get().settings.concurrency)
    const promises = repos.map((repo) =>
      limit(async () => {
        await command(repo)
        //Remove this repository from processing after the command has been executed
        set((state) => ({
          reposProcessing: state.reposProcessing.filter((r) => r !== repo.path),
          workspaces: state.workspaces.map((w) =>
            w.name == workspace.name ? { ...w, repositories: w.repositories.map((r) => (r.path === repo.path ? repo : r)) } : w
          ),
          globalError: repos.length === 1 && repo.lastError ? repo.lastError : state.globalError
        }))
      })
    )

    //Await the commands has been executed on all repositories
    await Promise.all(promises)
  },
  getSelectedWorkspace: (): Workspace | undefined => {
    const workspace = get().workspaces.find((w) => w.selected)
    return workspace
  },
  persist: (): void => {
    try {
      saveStoreToFile(get())
    } catch (error) {
      set(() => ({
        globalError:
          'Failed to save appdata file. The appdata file is where application data such as workspaces, repositories, etc. are stored. If you restart the application your workspaces will not be restored if we are not able to write to this file. Message: ' +
          error
      }))
    }
  },
  initialize: async (): Promise<void> => {
    //Only initialize once
    if (!get().initialized) {
      //Load initial state from appData file
      try {
        const appDataFileState: Partial<StoreState> = await loadStoreFromFile()
        //Update the store state from the data we pulled from the appdata file
        set(() => ({
          ...appDataFileState,
          initialized: true
        }))
      } catch (error) {
        //If we couldn't read the appdata file, show an error message to the user
        set(() => ({
          globalError:
            'Failed to load appdata file. The appdata file is where application data such as workspaces, repositories, etc. are stored. Message: ' +
            error,
          initialized: true
        }))
      }

      //Call setSelectedWorkspace to trigger init logic that runs when changing workspace
      const selectedWorkspaceName = get().getSelectedWorkspace()?.name
      if (selectedWorkspaceName) {
        get().setSelectedWorkspace(selectedWorkspaceName)
      }

      //Get new status on repositories on window is refocused
      window.electron.ipcRenderer.on('window-focused', async () => {
        console.log('Update repositories on window focus')
        get().runCommandOnRepositories((repo) => repo.refresh(), get().getSelectedWorkspace()?.repositories, false)
      })
    }
  }
}))

export function useSelectedWorkspace(): Workspace | undefined {
  const workspaces = useStore((s) => s.workspaces)
  return workspaces.find((w) => w.selected)
}

export function useCheckedRepos(): Repository[] {
  const selectedWorkspace = useSelectedWorkspace()
  const checkedRepos = useStore((s) => s.checkedRepos)
  return selectedWorkspace?.repositories.filter((r) => checkedRepos[r.path]) ?? []
}

export default useStore
