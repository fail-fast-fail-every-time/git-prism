import { useStore } from '@/stores/store'
import { diffTypeToChangeType } from '@/Util'
import { Columns2, Rows2 } from 'lucide-react'
import { ReactElement } from 'react'
import { Decoration, Diff, FileData, Hunk } from 'react-diff-view'
import ChangeTypeBadge from './ChangeTypeBadge'
import { Separator } from './shadcn/Separator'
import { Tabs, TabsList, TabsTrigger } from './shadcn/tabs'

interface FileDiffProps {
  diff: FileData
  repoBasePath: string
}

export default function FileDiff({ diff, repoBasePath }: FileDiffProps): ReactElement {
  const diffViewType = useStore((state) => state.diffViewType)
  const setDiffViewType = useStore((state) => state.setDiffViewType)
  const filePath = diff.type === 'delete' ? diff.oldPath : diff.newPath
  const fileName = window.api.io.basename(filePath)

  return (
    <div className="bg-secondary mt-0 px-5 py-3">
      <div>
        <div className="float-right">
          <Tabs defaultValue={'split'} className="flex flex-col flex-grow min-h-0">
            <div className="">
              <TabsList>
                <TabsTrigger value="unified" onClick={() => setDiffViewType('unified')}>
                  <Rows2 size={16} className="mr-1" />
                  Unified
                </TabsTrigger>
                <TabsTrigger value="split" onClick={() => setDiffViewType('split')}>
                  <Columns2 size={16} className="mr-1" />
                  Split
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>
        <div className="flex gap-1 text-sm">
          {fileName}
          <ChangeTypeBadge changeType={diffTypeToChangeType(diff.type)} />
        </div>
        <div className="text-muted-foreground text-xs">
          {repoBasePath}/{filePath}
        </div>
      </div>
      <div className="mt-3 p-3 rounded-md diff-container">
        <Diff viewType={diffViewType} diffType={diff.type} hunks={diff.hunks} className="text-xs">
          {(hunks) =>
            hunks.map((hunk, index) => (
              <>
                {index != 0 && (
                  <Decoration key={index}>
                    <Separator className="my-5" />
                  </Decoration>
                )}
                <Hunk key={hunk.content} hunk={hunk} />
              </>
            ))
          }
        </Diff>
        {diff.hunks.length === 0 && <div className="text-sm italic">Empty file</div>}
      </div>
    </div>
  )
}
