import { ElectronAPI } from '@electron-toolkit/preload'
import { BranchSummary, DiffResult, FetchResult, MergeResult, PullResult, PushResult, StatusResult } from 'simple-git'

export interface IApi {
  io: {
    openFolders: () => Promise<string[]>
    openFileExplorer: (path: string) => Promise<void>
    saveFile: (path: string, content: string) => Promise<boolean>
    loadFile: (path: string) => Promise<string>
    deleteFile: (path: string) => void
    fileExists: (path: string) => Promise<boolean>
    basename: (path: string) => string
    dirname: (path: string) => string
    joinPaths: (...paths: string[]) => string
    exec: (command: string, options: string[], workingDirectory?: string) => Promise<{ success: boolean; stdout: string; stderr: string }>
  }
  git: {
    status: (path: string) => Promise<StatusResult>
    revParse: (path: string, argument: string) => Promise<string>
    merge: (path: string, branchToMerge: string) => Promise<MergeResult>
    raw: (path, options: string[]) => Promise<string>
    getRemotes: (path) => Promise<RemoteWithoutRefs[]>
    rebase: (path, options: string[]) => Promise<string>
    commit: (path, commitMessage: string, files: string[] | undefined) => Promise<CommitResult>
    add: (path, files: string[]) => Promise<string>
    show: (path, commitHash: string, params: string[]) => Promise<string>
    fetch: (path: string) => Promise<FetchResult>
    pull: (path: string) => Promise<PullResult>
    push: (path: string, options: string[]) => Promise<PushResult>
    log: (path: string, options: object) => Promise<LogResult<DefaultLogFields>>
    createBranch: (path: string, branch: string) => Promise<BranchSummary>
    checkout: (path: string, options: string[]) => Promise<string>
    diff: (path: string, options: string[]) => Promise<string>
    diffSummary: (path: string) => Promise<DiffResult>
    getBranchSummary: (path: string) => Promise<BranchSummary>
    getRepositoryRootFolder: (path: string) => Promise<string>
    checkIsRepo: (path: string) => Promise<boolean>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IApi
  }
}
