import { useRef, useState } from 'react'
import { ScrollView, View, Text, Pressable, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../theme'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { PRIVACY_SECTIONS, DATA_CATEGORIES } from '../content/legal/privacyPolicy'
import { TERMS_SECTIONS } from '../content/legal/termsAndConditions'

const SUPPORT_EMAIL = 'support@mzobs.com'
const LAST_UPDATED = '19 September 2026'

const DOCS = {
  privacy: {
    sections: PRIVACY_SECTIONS,
    title: 'Privacy Policy',
    heading: 'How we handle your data',
    dates: `Last updated: ${LAST_UPDATED}`,
    intro: [
      'Mzobs is operated by Mesho Solutions (“Mzobs”, “we”, “us”, or “our”). Mzobs provides a technology platform that connects job seekers/candidates with employers and recruiters, facilitates job discovery and applications, supports candidate and employer profiles, enables communication between users, provides hiring-related tools, and facilitates employer payments for Mzobs services.',
      'This Privacy Policy explains how Mzobs collects, receives, uses, stores, processes, shares, protects, retains, and deletes information when you use the Mzobs mobile application, website, APIs, and related services (collectively, the “Services”). By creating an account, accessing, or using the Services, you acknowledge that you have read and understood this Privacy Policy.',
    ],
    other: { screen: 'TermsAndConditions', label: 'Terms & Conditions' },
  },
  terms: {
    sections: TERMS_SECTIONS,
    title: 'Terms & Conditions',
    heading: 'The rules of using Mzobs',
    dates: `Effective: ${LAST_UPDATED} · Last updated: ${LAST_UPDATED}`,
    intro: [
      'These Terms & Conditions (“Terms”, “Terms of Use”, or “Agreement”) govern your access to and use of the Mzobs website, mobile application, candidate portal, employer portal, APIs, and related services (collectively, the “Services”). Mzobs is operated by Mesho Solutions (“Mzobs”, “we”, “us”, or “our”).',
      'By creating an account, accessing, or using Mzobs, you agree to be bound by these Terms and our Privacy Policy. If you do not agree with these Terms, you must not access or use the Services.',
    ],
    other: { screen: 'PrivacyPolicy', label: 'Privacy Policy' },
  },
}

function Body({ children, style }) {
  const { colors, fontFamily } = useTheme()
  return (
    <Text style={[{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 21 }, style]}>{children}</Text>
  )
}

function Blocks({ blocks }) {
  const { colors, spacing, fontFamily } = useTheme()
  return blocks.map((b, i) => {
    if (b.h) {
      return (
        <Text key={i} style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14.5, marginTop: spacing.xs, marginBottom: spacing.sm }}>
          {b.h}
        </Text>
      )
    }
    const list = b.ul ?? b.ol
    if (list) {
      return (
        <View key={i} style={{ marginBottom: spacing.md, gap: 6 }}>
          {list.map((item, n) => (
            <View key={item} style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Text style={{ width: 18, color: colors.navy, fontFamily: fontFamily.bold, fontSize: 14, lineHeight: 21 }}>
                {b.ol ? `${n + 1}.` : '•'}
              </Text>
              <Body style={{ flex: 1 }}>{item}</Body>
            </View>
          ))}
        </View>
      )
    }
    return <Body key={i} style={{ marginBottom: spacing.md }}>{b.p}</Body>
  })
}

function ContactCard() {
  const { colors, spacing, fontFamily } = useTheme()
  const row = (label, value, onPress) => (
    <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 24 }}>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold }}>{label}: </Text>
      {onPress ? (
        <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, textDecorationLine: 'underline' }} onPress={onPress}>
          {value}
        </Text>
      ) : (
        value
      )}
    </Text>
  )
  return (
    <Card style={{ marginBottom: spacing.md }}>
      {row('Company', 'Mesho Solutions')}
      {row('Platform', 'Mzobs')}
      {row('Website', 'https://mzobs.com', () => Linking.openURL('https://mzobs.com'))}
      {row('Email', SUPPORT_EMAIL, () => Linking.openURL(`mailto:${SUPPORT_EMAIL}`))}
    </Card>
  )
}

function DataTable() {
  const { colors, spacing, fontFamily } = useTheme()
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      {DATA_CATEGORIES.map(([cat, examples, purpose], i) => (
        <View key={cat} style={{ padding: spacing.md, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14 }}>{cat}</Text>
          <Body style={{ marginTop: 2, fontSize: 13 }}>{examples}</Body>
          <Text style={{ color: colors.navy, fontFamily: fontFamily.medium, fontSize: 12.5, marginTop: 3 }}>{purpose}</Text>
        </View>
      ))}
    </Card>
  )
}

function Extra({ kind }) {
  const { spacing } = useTheme()
  const navigation = useNavigation()
  const { isAuthenticated } = useAuth()
  if (kind === 'contact' || kind === 'contactTerms') return <ContactCard />
  if (kind === 'dataTable') return <DataTable />
  if (kind === 'privacyLink') {
    return <Button title="Read the Privacy Policy" variant="secondary" onPress={() => navigation.navigate('PrivacyPolicy')} style={{ marginBottom: spacing.md }} />
  }
  if (kind === 'deleteAccount' && isAuthenticated) {
    return <Button title="Go to account deletion in Settings" variant="secondary" onPress={() => navigation.navigate('Settings')} style={{ marginBottom: spacing.md }} />
  }
  return null
}

function LegalDocumentScreen({ docKey }) {
  const { colors, spacing, fontFamily } = useTheme()
  const navigation = useNavigation()
  const doc = DOCS[docKey]
  const scrollRef = useRef(null)
  const offsets = useRef({})
  const [showContents, setShowContents] = useState(false)

  function jumpTo(i) {
    const y = offsets.current[i]
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true })
    setShowContents(false)
  }

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <View>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 30 }}>{doc.heading}</Text>
          <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.medium, fontSize: 12.5, marginTop: 6, marginBottom: spacing.md }}>{doc.dates}</Text>
          {doc.intro.map((p) => (
            <Body key={p} style={{ marginBottom: spacing.md }}>{p}</Body>
          ))}

          <Pressable
            onPress={() => setShowContents((v) => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showContents }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: spacing.md,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              marginBottom: showContents ? 0 : spacing.lg,
            }}
          >
            <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14 }}>Contents ({doc.sections.length} sections)</Text>
            <Feather name={showContents ? 'chevron-up' : 'chevron-down'} size={18} color={colors.inkSecondary} />
          </Pressable>
          {showContents ? (
            <View style={{ padding: spacing.md, borderWidth: 1, borderTopWidth: 0, borderColor: colors.border, backgroundColor: colors.surface, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, marginBottom: spacing.lg }}>
              {doc.sections.map((s, i) => (
                <Pressable key={s.title} onPress={() => jumpTo(i)} style={{ flexDirection: 'row', paddingVertical: 7, gap: 8 }}>
                  <Text style={{ width: 26, color: colors.inkTertiary, fontFamily: fontFamily.medium, fontSize: 13 }}>{i + 1}.</Text>
                  <Text style={{ flex: 1, color: colors.navy, fontFamily: fontFamily.medium, fontSize: 13.5 }}>{s.title}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {doc.sections.map((section, i) => (
            <View
              key={section.title}
              onLayout={(e) => {
                offsets.current[i] = e.nativeEvent.layout.y
              }}
              style={{ marginBottom: spacing.md }}
            >
              <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 18, lineHeight: 24, marginBottom: spacing.sm }}>
                {i + 1}. {section.title}
              </Text>
              <Blocks blocks={section.blocks} />
              {section.extra ? <Extra kind={section.extra} /> : null}
            </View>
          ))}

          <Pressable onPress={() => navigation.navigate(doc.other.screen)} style={{ marginTop: spacing.md }}>
            <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13 }}>
              See also our <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold }}>{doc.other.label}</Text>.
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export function PrivacyPolicyScreen() {
  return <LegalDocumentScreen docKey="privacy" />
}

export function TermsAndConditionsScreen() {
  return <LegalDocumentScreen docKey="terms" />
}
