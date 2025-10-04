import { CheckIcon, Copy } from 'lucide-react'
import { ReactElement, useState } from 'react'
import { Button } from './shadcn/Button'

//A copy button component which takes a string to copy to clipboard
//When the user clicks the button, the string is copied to the clipboard and the icon changes to a checkmark
export default function CopyButton({ text, className }: { text: string; className?: string }): ReactElement {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e): Promise<void> => {
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Button variant="ghost" onClick={handleCopy} className={className}>
      {copied ? <CheckIcon size={16} /> : <Copy size={16} />}
    </Button>
  )
}
