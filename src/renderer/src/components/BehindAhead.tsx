import { ReactElement } from 'react'

interface BehindAheadProps {
  behind: number
  ahead: number
}

export function BehindAhead({ behind, ahead }: BehindAheadProps): ReactElement {
  //Calculate the width of the behind/ahead bars as a percentage of the total width of the container
  //If the number of commits behind/ahead is greater than 10, the bar width is 100%
  const behindBarWidth = Math.min(behind * 10, 100)
  const aheadBarWidth = Math.min(ahead * 10, 100)

  return (
    <>
      <div className="flex divide-x divide-primary/50">
        <div className={`relative text-right flex-1 ${behind > 0 || ahead > 0 ? 'pb-2' : ''}`}>
          <div className="mr-1">{behind}</div>
          <div className="right-0 absolute bg-primary rounded-l-full h-1" style={{ width: `${behindBarWidth}%` }}></div>
        </div>
        <div className="flex-1">
          <div className="ml-1">{ahead}</div>
          <div className="right-0 bg-primary rounded-r-full h-1" style={{ width: `${aheadBarWidth}%` }}></div>
        </div>
      </div>
    </>
  )
}
