import { MultiSelect, type MultiSelectOption } from '@/components/shadcn/multi-select'
import Repository from '@/models/Repository'
import React from 'react'

interface RepositorySelectorProps {
  options: Repository[]
  defaultValues?: Repository[] | undefined
  onValueChange: (selected: Repository[]) => void
  maxCount?: number
}

export default function RepositorySelector({
  options,
  defaultValues,
  onValueChange,
  maxCount = 3
}: RepositorySelectorProps): React.ReactElement {
  const selectOptions: MultiSelectOption[] = options.map((r) => ({
    value: r.path,
    label: r.name
  }))

  const handleValueChange = (values: string[]): void => {
    const selectedRepos = values.map((v) => options.find((o) => o.path === v)).filter((r): r is Repository => r !== undefined)
    onValueChange(selectedRepos)
  }

  const def = defaultValues ? defaultValues.map((d) => d.path) : []

  return (
    <MultiSelect
      options={selectOptions}
      placeholder="Select repositories"
      defaultValue={def}
      onValueChange={handleValueChange}
      maxCount={maxCount}
      className="multiselect"
    />
  )
}
