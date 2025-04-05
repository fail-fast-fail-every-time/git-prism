import useKeyPressed from '@/hooks/useKeyPressed'
import Repository from '@/models/Repository'
import { X } from 'lucide-react'
import { ReactElement, useEffect, useState } from 'react'
import BranchSelector from '../BranchSelector'
import CopyButton from '../CopyButton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../shadcn/tabs'
import RepoChanges from './RepoChanges'
import RepoHistory from './RepoHistory'

interface RepoViewProps {
  repo: Repository
  onCancel: () => void
}

export default function RepoView({ repo, onCancel }: RepoViewProps): ReactElement {
  const [topPosition, setTopPosition] = useState<string>('top-[90vh]')
  useKeyPressed('Escape', onCancel)

  useEffect(() => {
    setTopPosition('top-[10vh]')
  })

  return (
    <>
      <div className="z-10 fixed inset-0 bg-black bg-opacity-70"></div>
      <div className="top-0 right-0 left-0 z-10 fixed h-[10vh] no-drag" onClick={onCancel}></div>
      <div className={`transition-all duration-300 right-0 bottom-0 left-0 fixed z-20 ${topPosition}`}>
        <div className="flex flex-col gap-2 bg-background px-3 py-5 rounded-t-xl h-[90vh]">
          <div className="top-0 right-0 absolute p-3 cursor-pointer" onClick={onCancel}>
            <X size={16} />
          </div>
          <div className="flex items-center gap-7 px-2">
            <div>{repo.name}</div>
            <div>
              <BranchSelector repo={repo} />
              <CopyButton text={repo.branch ?? ''} className="ml-[-5px] p-2" />
            </div>
          </div>
          <Tabs defaultValue={repo.files.length > 0 ? 'changes' : 'history'} className="flex flex-col flex-grow min-h-0">
            <div className="">
              <TabsList>
                <TabsTrigger value="changes">Changes ({repo.files.length})</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="changes" className="min-h-0">
              <RepoChanges repo={repo} />
            </TabsContent>
            <TabsContent value="history" className="min-h-0">
              <RepoHistory repo={repo} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
