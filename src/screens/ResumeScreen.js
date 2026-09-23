import { useState } from 'react'
import { View, Text } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useResumeQuery, useUploadResumeMutation } from '../hooks/useResume'
import { useProfileQuery } from '../hooks/useProfile'
import { resumeStatusTone, resumeStatusLabel } from '../lib/statusTone'
import { fmtDate } from '../lib/format'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ErrorState from '../components/ui/ErrorState'
import { notifySuccess, notifyError } from '../lib/haptics'
import ResumeSkeleton from '../components/ui/skeletons/ResumeSkeleton'

export default function ResumeScreen() {
  const { colors, spacing, fontFamily } = useTheme()
  const { data, isLoading, isError, refetch, isRefetching } = useResumeQuery()
  const { isLoading: profileLoading } = useProfileQuery()
  const uploadMutation = useUploadResumeMutation()
  const [error, setError] = useState('')
  const [isPicking, setIsPicking] = useState(false)

  if (isLoading || profileLoading) return <ResumeSkeleton />
  if (isError && !data)
    return (
      <ScreenContainer>
        <ErrorState title="Couldn't load your resume" onRetry={refetch} retrying={isRefetching} />
      </ScreenContainer>
    )

  const resume = data?.resume
  const history = data?.resumeHistory ?? []
  const status = resume?.status ?? 'none'

  async function handlePick() {
    if (isPicking) return
    setError('')
    setIsPicking(true)
    // Both the native file-browser launch and the upload itself can throw
    // (e.g. Android's "document picker already active" if the button is
    // tapped twice in quick succession) — without this try/catch around the
    // whole flow, that exception was an unhandled promise rejection: no
    // picker, no error message, nothing visibly happens on tap. isPicking
    // covers the picker's own launch, which uploadMutation.isPending doesn't
    // (that only tracks the upload, which starts after a file is chosen).
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      })
      if (result.canceled) return
      await uploadMutation.mutateAsync(result.assets[0])
      notifySuccess()
    } catch (err) {
      notifyError()
      setError(err.response?.data?.message ?? 'Could not open the file picker. Please try again.')
    } finally {
      setIsPicking(false)
    }
  }

  return (
    <ScreenContainer onRefresh={refetch} refreshing={isRefetching}>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }}>Resume Center</Text>
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, marginTop: 4 }}>
        Once your resume is uploaded, you can start applying right away.
      </Text>

      <Card style={{ marginTop: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm, flex: 1, paddingRight: spacing.sm }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.navyTint, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="file-text" size={17} color={colors.navy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 15 }}>
                {resume?.file || 'No resume uploaded yet'}
              </Text>
              {resume?.uploadedOn ? (
                <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 3 }}>
                  Version {resume.version} · Uploaded {fmtDate(resume.uploadedOn)}
                </Text>
              ) : null}
            </View>
          </View>
          <Badge label={resumeStatusLabel(status)} tone={resumeStatusTone[status] ?? 'gray'} />
        </View>

        {resume?.score != null ? (
          <Text style={{ color: colors.navy, fontFamily: fontFamily.bold, fontSize: 20, marginTop: spacing.md }}>{resume.score}/100</Text>
        ) : null}
        {resume?.note ? (
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: spacing.sm }}>{resume.note}</Text>
        ) : null}

        {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: spacing.md }}>{error}</Text> : null}

        <Button
          title={resume?.version ? 'Upload new version' : 'Upload resume'}
          onPress={handlePick}
          loading={isPicking || uploadMutation.isPending}
          style={{ marginTop: spacing.lg }}
        />
      </Card>

      {history.length > 0 ? (
        <>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 15, marginTop: spacing.xl, marginBottom: spacing.sm }}>
            Previous versions
          </Text>
          <Card style={{ padding: 0 }}>
            {history.map((h, i) => (
              <View
                key={`${h.version}-${i}`}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                }}
              >
                <View>
                  <Text style={{ color: colors.ink, fontFamily: fontFamily.medium, fontSize: 13.5 }}>Version {h.version}</Text>
                  <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 2 }}>{fmtDate(h.uploadedOn)}</Text>
                </View>
                <Badge label={resumeStatusLabel(h.status)} tone={resumeStatusTone[h.status] ?? 'gray'} />
              </View>
            ))}
          </Card>
        </>
      ) : null}
    </ScreenContainer>
  )
}
