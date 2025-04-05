import useStore from '@/stores/store'
import { ReactElement } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from './shadcn/alert-dialog'

export default function ErrorMessage(): ReactElement {
  const globalError = useStore((state) => state.globalError)
  const setGlobalError = useStore((state) => state.setGlobalError)

  return (
    <AlertDialog open={globalError != undefined}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Error</AlertDialogTitle>
          <AlertDialogDescription>{globalError}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setGlobalError(undefined)}>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
