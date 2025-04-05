import clsx from 'clsx'
import { HTMLAttributes, ReactElement } from 'react'

type CounterProps = {
  count: number
} & HTMLAttributes<HTMLDivElement>

export default function Counter({ count, className, ...props }: CounterProps): ReactElement {
  return (
    <div
      className={clsx('absolute bg-primary rounded-[15px] min-w-[15px] text-[10px] text-primary-foreground leading-[16px]', className)}
      {...props}
    >
      {count}
    </div>
  )
}
