import { useQuery } from '@tanstack/react-query'
import { getHotCities } from '../services/hotCitiesService'
import { queryKeys } from '../lib/queryClient'

export function useHotCitiesQuery() {
  return useQuery({ queryKey: queryKeys.hotCities, queryFn: getHotCities })
}
