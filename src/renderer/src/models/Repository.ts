import {
  BranchSummary,
  BranchSummaryBranch,
  DefaultLogFields,
  DiffResult,
  FetchResult,
  FileStatusResult,
  LogResult,
  PullResult,
  PushResult,
  StatusResult
} from 'simple-git'

export enum GitChangeType {
  Added = 'added',
  Deleted = 'deleted',
  Modified = 'modified',
  Renamed = 'renamed',
  Conflicted = 'conflicted'
}

export class GitChange {
  public type: GitChangeType
  public filePath: string
  public directoryPath: string
  public fileName: string
  public oldFilePath: string | undefined = undefined
  public untracked: boolean = false

  constructor(type: GitChangeType, filePath: string, oldFilePath: string | undefined = undefined, untracked = false) {
    this.type = type
    this.filePath = filePath
    this.oldFilePath = oldFilePath
    this.directoryPath = window.api.io.dirname(filePath)
    this.directoryPath = this.directoryPath === '.' ? '' : this.directoryPath
    this.fileName = window.api.io.basename(filePath)
    this.untracked = untracked
  }
}

export default class Repository {
  public name: string = ''
  public path: string = ''
  public log: string = ''
  public disabled: boolean = false
  public lastError: string | undefined
  public latestCommitAuthor: string | null = null
  public latestCommitDate: Date | null = null
  public lastStatus: Date | null = null

  //Branch information
  public branches: BranchSummaryBranch[] = []
  public branch: string | null = null
  public branchSummary: BranchSummaryBranch | null = null
  public ahead: number | undefined
  public behind: number | undefined
  public tracking: string | null = null
  public rebaseInProgress: boolean = false

  //Status / file changes
  public files: FileStatusResult[] = []
  public notAdded: string[] | null = null
  public created: string[] | null = null
  public deleted: string[] | null = null
  public modified: string[] | null = null
  public renamed: { from: string; to: string }[] | null = null
  public conflicts: string[] = []

  constructor(name: string, path: string) {
    this.name = name
    this.path = path
  }

  public get key(): string {
    return this.path
  }

  public get changes(): GitChange[] {
    let changes = [
      ...(this.notAdded?.map((path) => new GitChange(GitChangeType.Added, path, undefined, true)) ?? []),
      ...(this.created?.map((path) => new GitChange(GitChangeType.Added, path)) ?? []),
      ...(this.deleted?.map((path) => new GitChange(GitChangeType.Deleted, path)) ?? []),
      ...(this.modified?.map((path) => new GitChange(GitChangeType.Modified, path)) ?? []),
      ...(this.conflicts?.map((path) => new GitChange(GitChangeType.Conflicted, path)) ?? []),
      ...(this.renamed?.map((rename) => new GitChange(GitChangeType.Renamed, rename.to, rename.from)) ?? [])
    ]
    changes = changes.sort((a, b) => a.filePath.localeCompare(b.filePath))
    return changes
  }

  equals(repo: Repository): boolean {
    return this.path === repo.path
  }

  private async execute(command: () => Promise<any>): Promise<any> {
    if (!(await window.api.git.checkIsRepo(this.path))) {
      this.lastError = 'A GIT repository was not found in folder: ' + this.path
      this.disabled = true
      return
    } else {
      this.disabled = false
    }

    try {
      this.lastError = undefined
      const result = await command()
      return result
    } catch (e: any) {
      this.lastError = e.toString()
      console.log('Command failed', this.name, this.lastError, e)
      return null
    }
  }

  public async refresh(): Promise<void> {
    const status: StatusResult = await this.execute(() => window.api.git.status(this.path))
    if (!status) {
      return
    }
    console.log('status', this.name, status)
    this.branch = status.current
    this.ahead = status.ahead
    this.behind = status.behind
    this.files = status.files
    this.notAdded = status.not_added
    this.created = status.created
    this.deleted = status.deleted
    this.modified = status.modified
    this.renamed = status.renamed
    this.tracking = status.tracking
    this.conflicts = status.conflicted
    this.lastStatus = new Date()

    this.rebaseInProgress = (await this.revParse('REBASE_HEAD')) !== null

    const branchSummary: BranchSummary = await this.execute(() => window.api.git.getBranchSummary(this.path))
    console.log('branch summary', this.name, branchSummary)
    if (!branchSummary) {
      return
    }
    this.branchSummary = this.branch && branchSummary.branches[this.branch] ? branchSummary.branches[this.branch] : null
    this.branches = Object.values(branchSummary.branches)

    const log: LogResult<DefaultLogFields> = await this.getLog({ n: 1 })
    if (!log) {
      return
    }
    this.latestCommitAuthor = log?.latest?.author_name ?? null
    this.latestCommitDate = log?.latest?.date ? new Date(log?.latest?.date) : null
  }

  public async pull(): Promise<void> {
    const pullResult = (await this.execute(() => window.api.git.pull(this.path))) as PullResult
    console.log('Git pull', this.name, pullResult)
    if (!this.lastError) {
      await this.refresh()
    }
  }

  public async push(): Promise<void> {
    let pushResult: PushResult
    if (this.tracking) {
      console.log('tracking', this.tracking)
      pushResult = await this.execute(() => window.api.git.push(this.path, []))
    } else {
      const remotes = await window.api.git.getRemotes(this.path)
      if (remotes.length === 0) {
        this.lastError = 'No remotes defined, cannot push'
        return
      }
      console.log('pushing to remote', remotes[0].name)
      const pushParams = ['-u', remotes[0].name, this.branch]
      pushResult = await this.execute(() => window.api.git.push(this.path, pushParams))
    }
    console.log('Git push', this.name, pushResult)
    if (!this.lastError) {
      await this.refresh()
    }
  }

  public async getLog(options: object): Promise<LogResult<DefaultLogFields>> {
    const logResult = (await this.execute(() => window.api.git.log(this.path, options))) as LogResult<DefaultLogFields>
    console.log('Git log', this.name, logResult)
    return logResult
  }

  public async fetch(): Promise<void> {
    const fetchResult: FetchResult = await this.execute(() => window.api.git.fetch(this.path))
    console.log('Git fetch', this.name, fetchResult)
    if (!this.lastError) {
      await this.refresh()
    }
  }

  public async diffSummary(): Promise<DiffResult> {
    const result: DiffResult = await this.execute(() => window.api.git.diffSummary(this.path))
    console.log('Git diff summary', this.name, result)
    return result
  }

  public async diff(params: string[] = []): Promise<string> {
    const result = await window.api.git.diff(this.path, params)
    return result
  }

  public async rebase(options: string[]): Promise<string> {
    const result: string = await this.execute(() => window.api.git.rebase(this.path, options))
    await this.refresh()
    return result
  }

  public async revParse(argument: string): Promise<string | null> {
    const result = await window.api.git.revParse(this.path, argument).catch(() => null)
    return result
  }

  public async createBranch(branchName: string, checkoutBranch: boolean): Promise<void> {
    const branchResult = await this.execute(() => window.api.git.createBranch(this.path, branchName))
    console.log('Git create branch', this.name, branchResult)
    if (checkoutBranch && branchResult != null) {
      await this.checkoutBranch(branchName)
    }
  }

  public async checkoutBranch(branchName: string): Promise<void> {
    const isRemoteBranch = branchName.startsWith('origin/') || branchName.startsWith('remotes/origin')
    const checkoutParams = isRemoteBranch ? ['-t', branchName] : [branchName]

    const checkoutResult = await this.execute(() => window.api.git.checkout(this.path, checkoutParams))
    console.log('Git checkout', this.name, checkoutResult)
    if (!this.lastError) {
      await this.refresh()
    }
  }

  public async discardChanges(filePath: string): Promise<void> {
    const checkoutResult = await this.execute(() => window.api.git.checkout(this.path, ['--', filePath]))
    console.log('Git discard file', this.name, checkoutResult)
    if (!this.lastError) {
      await this.refresh()
    }
  }

  public async merge(branchToMerge: string): Promise<void> {
    const mergeResult = await this.execute(() => window.api.git.merge(this.path, branchToMerge))
    console.log('Git merge', this.name, mergeResult)
    await this.refresh()
  }

  public async commit(commitMessage: string, files?: string[]): Promise<void> {
    const commitResult = await this.execute(() => window.api.git.commit(this.path, commitMessage, files))
    console.log('Git commit', this.name, commitResult)
    if (!this.lastError) {
      await this.refresh()
    }
  }

  public async add(files: string[]): Promise<void> {
    const addResult = await this.execute(() => window.api.git.add(this.path, files))
    console.log('Git add', this.name, addResult)
  }

  public async show(commitHash: string, params: string[] = []): Promise<string> {
    const showResult = await this.execute(() => window.api.git.show(this.path, commitHash, params))
    console.log('Git show', this.name, showResult)
    return showResult
  }

  public async runCommandRaw(command: string): Promise<string> {
    let args = command.split(' ')
    if (args[0] === 'git') {
      args = args.splice(1)
    }

    const result = await this.execute(() => window.api.git.raw(this.path, args))
    console.log('Git raw command', this.name, args, result)
    if (!this.lastError) {
      await this.refresh()
    }
    return result
  }

  public static async GetRepositoryRootFolder(folderPath: string): Promise<string> {
    return window.api.git.getRepositoryRootFolder(folderPath)
  }
}
