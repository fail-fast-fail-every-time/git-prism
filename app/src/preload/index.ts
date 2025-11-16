import { electronAPI } from '@electron-toolkit/preload'
import { spawn } from 'child_process'
import { contextBridge, ipcRenderer } from 'electron'
import { promises as fs, unlinkSync } from 'fs'
import path, { normalize } from 'path'
import simpleGit, {
  BranchSummary,
  CommitResult,
  DefaultLogFields,
  DiffResult,
  FetchResult,
  LogResult,
  MergeResult,
  PullResult,
  PushResult,
  RemoteWithoutRefs,
  SimpleGit,
  StatusResult
} from 'simple-git'

// Custom APIs for renderer
const api = {
  io: {
    openFolders: async (): Promise<string[]> => await ipcRenderer.invoke('openFolders'),
    openFileExplorer,
    loadFile,
    saveFile,
    fileExists,
    basename,
    dirname,
    deleteFile,
    joinPaths,
    exec
  },
  git: {
    status,
    revParse,
    merge,
    add,
    fetch,
    pull,
    push,
    getRemotes,
    log,
    diff,
    checkout,
    diffSummary,
    getBranchSummary,
    getRepositoryRootFolder,
    createBranch,
    raw,
    rebase,
    commit,
    checkIsRepo,
    show
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

async function openFileExplorer(path: string): Promise<void> {
  path = normalize(path)
  console.log('Open Path ', path)
  const platform = process.platform
  if (platform === 'win32') {
    // Windows
    spawn('explorer', [path], { shell: true })
  } else if (platform === 'darwin') {
    // macOS
    spawn('open', [path], { shell: true })
  } else if (platform === 'linux') {
    // Linux
    spawn('xdg-open', [path], { shell: true })
  } else {
    console.error('Unsupported platform')
  }
}

async function loadFile(path: string): Promise<string> {
  const content = await fs.readFile(path, 'utf-8')
  return content
}

async function saveFile(path: string, content: string): Promise<string> {
  await fs.writeFile(path, content)
  return path
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.stat(path)
    return true
  } catch (error) {
    return false
  }
}

function basename(folder: string): string {
  return path.basename(folder)
}

function dirname(folder: string): string {
  return path.dirname(folder)
}

function deleteFile(path: string): void {
  path = normalize(path)
  unlinkSync(path)
}

function joinPaths(...paths: string[]): string {
  return path.join(...paths)
}

async function exec(command: string, args: string[] = [], cwd?: string): Promise<{ success: boolean; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: true, cwd })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('error', (err) => {
      console.log('Command failed', command, err, stdout, stderr)
      reject(err)
    })

    child.on('close', (code) => {
      console.log('exec command finished executing', code, stdout, stderr)
      const success = code === 0
      resolve({ success, stdout, stderr })
    })
  })
}

async function status(path: string): Promise<StatusResult> {
  const git: SimpleGit = simpleGit(path)
  const status: StatusResult = await git.status()
  return status
}

async function revParse(path: string, argument: string): Promise<string> {
  const git: SimpleGit = simpleGit(path)
  const status: string = await git.revparse(argument)
  return status
}

async function merge(path: string, branchToMerge): Promise<MergeResult> {
  const git: SimpleGit = simpleGit(path)
  const result: MergeResult = await git.merge([branchToMerge])
  return result
}

async function raw(path, options: string[]): Promise<string> {
  const git: SimpleGit = simpleGit(path)
  const result: string = await git.raw(options)
  return result
}

async function rebase(path, options: string[]): Promise<string> {
  const git: SimpleGit = simpleGit(path)
  const result: string = await git.rebase(options)
  return result
}

async function commit(path, commitMessage: string, files: string[] | undefined): Promise<CommitResult> {
  const git: SimpleGit = simpleGit(path)
  const result: CommitResult = await git.commit(commitMessage, files)
  return result
}

async function add(path, files: string[]): Promise<string> {
  const git: SimpleGit = simpleGit(path)
  const result: string = await git.add(files)
  return result
}

async function fetch(path: string): Promise<FetchResult> {
  const git: SimpleGit = simpleGit(path)
  const fetchResult: FetchResult = await git.fetch()
  return fetchResult
}

async function getRemotes(path: string): Promise<RemoteWithoutRefs[]> {
  const git: SimpleGit = simpleGit(path)
  const result: RemoteWithoutRefs[] = await git.getRemotes()
  return result
}

async function show(path: string, commitHash: string, params: string[] = []): Promise<string> {
  const git: SimpleGit = simpleGit(path)
  const result: string = await git.show([commitHash, ...params])
  return result
}

async function pull(path: string): Promise<PullResult> {
  const git: SimpleGit = simpleGit(path)
  const pullResult: PullResult = await git.pull()
  return pullResult
}

async function push(path: string, options: string[] = []): Promise<PushResult> {
  const git: SimpleGit = simpleGit(path)
  const result: PushResult = await git.push(options)
  return result
}

async function log(path: string, options: object): Promise<LogResult<DefaultLogFields>> {
  const git: SimpleGit = simpleGit(path)
  const log: LogResult<DefaultLogFields> = await git.log(options)
  return log
}

async function createBranch(path: string, branch: string): Promise<BranchSummary> {
  const git: SimpleGit = simpleGit(path)
  const result: BranchSummary = await git.branch([branch])
  return result
}

async function checkout(path: string, options: string[]): Promise<string> {
  const git: SimpleGit = simpleGit(path)
  const result: string = await git.checkout(options)
  return result
}

async function diff(path: string, options: string[]): Promise<string> {
  const git: SimpleGit = simpleGit(path)
  try {
    const result: string = await git.diff(options)
    return result
  } catch (error: any) {
    const lineEndingsWarningRegex = /warning:.*(CRLF|CR|LF) will be replaced by (CRLF|CR|LF)/
    const errorText = error.message.toString()
    const match = lineEndingsWarningRegex.exec(errorText)
    if (match) {
      return errorText
    } else {
      throw error
    }
  }
}

async function diffSummary(path: string): Promise<DiffResult> {
  const git: SimpleGit = simpleGit(path)
  const diffSummary: DiffResult = await git.diffSummary()
  return diffSummary
}

async function getBranchSummary(path: string): Promise<BranchSummary> {
  const git: SimpleGit = simpleGit(path)
  const branchSummary: BranchSummary = await git.branch()
  return branchSummary
}

async function getRepositoryRootFolder(path: string): Promise<string> {
  const git: SimpleGit = simpleGit(path)
  return git.raw('rev-parse', '--show-toplevel')
}

async function checkIsRepo(path: string): Promise<boolean> {
  try {
    const git: SimpleGit = simpleGit(path)
    return await git.checkIsRepo()
  } catch (error) {
    return false
  }
}
