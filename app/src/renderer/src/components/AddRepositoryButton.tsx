import { Button } from '@/components/shadcn/Button'
import Repository from '@/models/Repository'
import useStore, { useSelectedWorkspace } from '@/stores/store'
import { CirclePlus } from 'lucide-react'
import { ReactElement } from 'react'

export default function AddRepositoryButton(): ReactElement {
  const selectedWorkspace = useSelectedWorkspace()
  const addRepositories = useStore((state) => state.addRepositories)
  const setGlobalError = useStore((state) => state.setGlobalError)

  //When the user clicks "Add Repositories" button
  const handleAddRepository = async (): Promise<void> => {
    //Open the native dialog to let user select folders
    const paths = await window.api.io.openFolders()
    console.log('Selected paths', paths)

    if (paths.length === 0) {
      return
    }

    //Instantiate repositories from the selected paths
    const repositories = await getRepositories(paths)
    if (repositories.length === 0) {
      setGlobalError('No repositories found in the selected folders')
      return
    }

    if (selectedWorkspace !== undefined) {
      //Add repositories to the currently selected workspace in the store
      addRepositories(selectedWorkspace, repositories)
    }
  }

  //Get repositories from the selected paths
  const getRepositories = async (paths: string[]): Promise<Repository[]> => {
    const getRepositoryPromises = paths.map(async (path) => {
      const repo = await getRepositoryFromFolderPath(path)
      return repo
    })

    const repositories = await Promise.all(getRepositoryPromises)
    return repositories.filter((repo) => repo !== undefined) as Repository[]
  }

  const getRepositoryFromFolderPath = async (folderPath: string): Promise<Repository | undefined> => {
    try {
      //Get the root folder (if user selects a subfolder of a git repo)
      let rootFolder = await Repository.GetRepositoryRootFolder(folderPath)
      rootFolder = rootFolder.trim()
      const repoName = window.api.io.basename(rootFolder)
      const repo = new Repository(repoName, rootFolder)
      repo.refresh()
      return repo
    } catch (err) {
      console.warn('Failed to initialize git repo', folderPath, err)
      return undefined
    }
  }

  return (
    <div className="content-center mt-2">
      <Button variant="ghost" className="gap-2 w-full text-xs" onClick={handleAddRepository}>
        <CirclePlus strokeWidth={2} size={20} />
        Add repositories
      </Button>
    </div>
  )
}
