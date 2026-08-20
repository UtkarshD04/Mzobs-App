import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as messagesService from '../services/messagesService'
import { queryKeys } from '../lib/queryClient'

export function useThreadsQuery() {
  return useQuery({ queryKey: queryKeys.messageThreads, queryFn: messagesService.listThreads })
}

export function useThreadMessagesQuery(threadId) {
  return useQuery({
    queryKey: queryKeys.threadMessages(threadId),
    queryFn: () => messagesService.getThreadMessages(threadId),
    enabled: !!threadId,
  })
}

export function useSendMessageMutation(threadId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (text) => messagesService.sendMessage({ threadId, text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.threadMessages(threadId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.messageThreads })
    },
  })
}
