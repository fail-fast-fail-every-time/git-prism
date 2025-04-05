import { Label } from '@/components/shadcn/Label'
import { ReactElement } from 'react'

interface FormLabelProps {
  children: string
  htmlFor: string
}

export function FormLabel({ htmlFor, children }: FormLabelProps): ReactElement {
  return (
    <Label className="block font-semibold" htmlFor={htmlFor}>
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
