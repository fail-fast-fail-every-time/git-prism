import { useStore } from '@/stores/store'
import { distinctBy } from '@/Util'
import pLimit from 'p-limit'
import Repository from './models/Repository'

let interval: NodeJS.Timeout

export function startTask(): void {
  if (interval) {
    return
  }
  console.log('Starting background job for periodically fetching repositories')

  //Check every 5 minutes if fetch should to be executed
  interval = setInterval(executeFetchIfIntervalExceeded, 1000 * 60 * 5)
}

async function executeFetchIfIntervalExceeded(): Promise<void> {
  const { setReposLastFetched, workspaces, settings } = useStore.getState()

  if (!shouldFetch()) {
    console.log('Dont fetch yet')
    return
  }

  setReposLastFetched(new Date())

  let repositories = workspaces.flatMap((w) => w.repositories)
  repositories = distinctBy(repositories, (repo: Repository) => repo.path)

  const limit = pLimit(settings.concurrency)
  const promises = repositories.map((repo) =>
    limit(async () => {
      await repo.fetch()
    })
  )
  await Promise.all(promises)
}

function shouldFetch(): boolean {
  const { settings, reposLastFetched } = useStore.getState()

  if (!settings.periodicallyFetchEnabled) {
    console.log('Background fetch not enabled, skip fetch')
    return false
  }

  //Get the number of minutes since the fetch was last performed
  const timeDiffInMs = new Date().valueOf() - new Date(reposLastFetched).valueOf()
  const timeDiffInMinutes = timeDiffInMs / (1000 * 60)

  const shouldFetch = timeDiffInMinutes > settings.periodicallyFetchIntervalMinutes
  if (shouldFetch) {
    console.log(
      `Execute background fetch. ${timeDiffInMinutes} minutes since last fetch at ${reposLastFetched}. Configured to fetch every ${settings.periodicallyFetchIntervalMinutes}`
    )
  }
  return shouldFetch
}
