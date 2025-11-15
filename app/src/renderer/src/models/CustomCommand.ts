export default interface CustomCommand {
  name: string
  pinToToolbar?: boolean
  commandPerRepo: Record<string, string>
}
