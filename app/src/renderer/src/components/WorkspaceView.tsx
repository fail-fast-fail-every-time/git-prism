import AddRepositoryButton from '@/components/AddRepositoryButton'
import RepositoryTable from '@/components/RepositoryTable'
import Toolbar from '@/components/Toolbar'
import Repository from '@/models/Repository'
import useStore, { useSelectedWorkspace } from '@/stores/store'
import { ReactElement, useState } from 'react'
import RepoView from './repo/RepoView'

export type RepositoryCommand = (repo: Repository) => Promise<any>

export default function WorkspaceView(): ReactElement {
  const selectedWorkspace = useSelectedWorkspace()
  const [selectedRepo, setSelectedRepo] = useState<Repository | undefined>(undefined)
  const reposProcessing = useStore((store) => store.reposProcessing)

  if (!selectedWorkspace) {
    return <></>
  }

  return (
    <div className="px-6">
      <Toolbar />
      {selectedRepo && <RepoView repo={selectedRepo} onCancel={() => setSelectedRepo(undefined)} />}
      {!selectedRepo && (
        <div className="h-[calc(100vh-200px)] overflow-y-auto">
          <RepositoryTable reposProcessing={reposProcessing} onSelectRepo={(r) => setSelectedRepo(r)} />
          <AddRepositoryButton />
        </div>
      )}
    </div>
  )
}
