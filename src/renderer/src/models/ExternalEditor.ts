export default class ExternalEditor {
  public executable: string
  public name: string

  public constructor(executable: string, name: string) {
    this.executable = executable
    this.name = name
  }
}
