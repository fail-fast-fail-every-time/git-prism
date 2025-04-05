import Repository from '@/models/Repository'

export default class Workspace {
  public name: string
  public repositories: Repository[]
  public selected: boolean

  constructor(name: string, repositories: Repository[], selected: boolean = false) {
    this.name = name
    this.repositories = repositories
    this.selected = selected
  }
}
