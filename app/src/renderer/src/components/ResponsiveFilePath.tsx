import { ReactElement } from 'react'

interface ResponsiveFilePathProps {
  filePath: string
}

export default function ResponsiveFilePath({ filePath }: ResponsiveFilePathProps): ReactElement {
  const dirPath = window.api.io.dirname(filePath)
  const fileName = window.api.io.basename(filePath)
  return (
    <>
      <div className="text-gray-500 text-sm truncate shrink-[9999]">{dirPath}/</div>
      <div className="flex-grow shrink-[1]">{fileName}</div>
    </>
  )
}
