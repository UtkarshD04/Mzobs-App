import { useState } from 'react'
import { View, Text } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { useTheme } from '../theme'
import { useResumeQuery, useUploadResumeMutation } from '../hooks/useResume'
import { resumeStatusTone, titleCase } from '../lib/statusTone'
import { fmtDate } from '../lib/format'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function ResumeScreen() {
  const { colors, spacing, fontFamily } = useTheme()
  const { data, isLoading, refetch, isRefetching } = useResumeQuery()
  const uploadMutation = useUploadResumeMutation()
  const [error, setError] = useState('')

  if (isLoading) return <LoadingSpinner />

  const resume = data?.resume
  const history = data?.resumeHistory ?? []
  const status = resume?.status ?? 'none'

  async function handlePick() {
    setError('')
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    })
    if (result.canceled) return

    try {
      await uploadMutation.mutateAsync(result.assets[0])
    } catch (err) {
      setError(err.response?.data?.message ?? 'Upload failed. Please try again.')
    }
  }

  return (
    <ScreenContainer onRefresh={refetch} refreshing={isRefetching}>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }}>Resume Center</Text>
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, marginTop: 4 }}>
        The Mzobs team reviews every resume before it can be used to apply.
      </Text>

      <Card style={{ marginTop: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: spacing.sm }}>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 15 }}>
              {resume?.file || 'No resume uploaded yet'}
            </Text>
            {resume?.uploadedOn ? (
              <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 3 }}>
                Version {resume.version} · Uploaded {fmtDate(resume.uploadedOn)}
              </Text>
            ) : null}
          </View>
          <Badge label={titleCase(status)} tone={resumeStatusTone[status] ?? 'gray'} />
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
          loading={uploadMutation.isPending}
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
                <Badge label={titleCase(h.status)} tone={resumeStatusTone[h.status] ?? 'gray'} />
              </View>
            ))}
          </Card>
        </>
      ) : null}
    </ScreenContainer>
  )
}
