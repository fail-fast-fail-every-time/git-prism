import Repository from '@/models/Repository'

export default class Workspace {
  public id: string
  public name: string
  public repositories: Repository[]
  public selected: boolean

  constructor(id: string, name: string, repositories: Repository[], selected: boolean = false) {
    this.id = id
    this.name = name
    this.repositories = repositories
    this.selected = selected
  }
}
