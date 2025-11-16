export default interface CustomCommand {
  name: string
  pinSetting: PinSetting
  pinToWorkspaceId: string | null //Used when pinSetting is 'Workspace'
  commandPerRepo: Record<string, string>
}

export enum PinSetting {
  AllWorkspaces = 'allWorkspaces',
  Workspace = 'workspace',
  None = 'none'
}
