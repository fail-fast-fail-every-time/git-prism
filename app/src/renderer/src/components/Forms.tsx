import { Label } from '@/components/shadcn/Label'
import clsx from 'clsx'
import { HTMLAttributes, ReactElement } from 'react'

type FormLabelProps = {
  children: string
  htmlFor?: string
} & HTMLAttributes<HTMLLabelElement>

export function FormLabel({ htmlFor, children, className, ...props }: FormLabelProps): ReactElement {
  return (
    <Label className={clsx('block font-semibold', className)} htmlFor={htmlFor} {...props}>
      {children}
    </Label>
  )
}

interface FormErrorProps {
  children: string | undefined
}

export function FormError({ children }: FormErrorProps): ReactElement {
  return <>{children && <div className="pt-2 text-red-500 text-sm text-right">{children}</div>}</>
}
