import { useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import {
  useSubscriptionQuery,
  usePlanQuery,
  useCreateSubscriptionOrderMutation,
  useVerifySubscriptionPaymentMutation,
  useConfirmMockSubscriptionPaymentMutation,
} from '../hooks/useSubscription'
import { useProfileQuery } from '../hooks/useProfile'
import { useApplicationsQuery } from '../hooks/useApplications'
import { fmtDate } from '../lib/format'
import ScreenContainer from '../components/ui/ScreenContainer'
import Button from '../components/ui/Button'
import CouponBox from '../components/ui/CouponBox'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorState from '../components/ui/ErrorState'
import { openRazorpayCheckout } from '../lib/razorpay'

const FALLBACK_FEE = 499

const SERVICE_CATEGORIES = [
  { key: 'resume', label: 'Resume & profile', icon: 'file-text' },
  { key: 'interview', label: 'Interview prep', icon: 'mic' },
  { key: 'skills', label: 'Skills', icon: 'award' },
  { key: 'career', label: 'Career planning', icon: 'map' },
  { key: 'coaching', label: 'Coaching', icon: 'users' },
]

const BASIC_POINTS = [
  'Browse every job with no limits',
  (limit) => `Apply to your first ${limit} jobs`,
  'Create your profile and upload your resume',
  'Get basic job matching and application tracking',
]

const PREMIUM_POINTS = [
  'Get unlimited job applications',
  'Get your CV enhanced by an expert, plus an ATS score',
  'Attend live technical, behavioral, and HR mock interviews',
  'Experience one to one HR and career coaching with a personal roadmap',
  'Gain premium visibility to recruiters',
]

const NEVER_CHARGED = [
  ['Being shortlisted', 'It is always free for you.'],
  ['Getting placed', 'No success fee and no cut of your salary.'],
  ['Renewals', 'Premium is a single payment, valid for life.'],
]

export default function SubscriptionScreen() {
  const { colors, spacing, fontFamily, radius } = useTheme()
  const { data: subscription, isLoading: l1, refetch, isRefetching } = useSubscriptionQuery()
  const { data: profile, isLoading: l2 } = useProfileQuery()
  const { data: plan, isLoading: l3, isError: planError, refetch: refetchPlan } = usePlanQuery()
  const { data: applications = [] } = useApplicationsQuery()
  const [category, setCategory] = useState('resume')
  const [openGroups, setOpenGroups] = useState(['jobs', 'profile'])
  const createOrder = useCreateSubscriptionOrderMutation()
  const verifyPayment = useVerifySubscriptionPaymentMutation()
  const confirmMockPayment = useConfirmMockSubscriptionPaymentMutation()
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const [couponResult, setCouponResult] = useState(null)

  if (l1 || l2 || l3) return <LoadingSpinner />
  if (planError || !plan) return <ErrorState title="Plans couldn't be loaded" onRetry={refetchPlan} />

  const fee = subscription.status === 'paid' ? (subscription.amount ?? plan.premium?.price ?? FALLBACK_FEE) : (plan.premium?.price ?? FALLBACK_FEE)
  const limit = plan.basic?.applicationLimit ?? 10
  const used = Math.min(applications.length, limit)
  const shown = (plan.services ?? []).filter((s) => s.category === category)
  const isPaid = subscription.status === 'paid'

  // Same order -> checkout -> signature-verify flow as the web account page
  // (Website/Frontend/src/pages/Subscription.jsx), via the native Razorpay
  // Checkout SDK (see lib/razorpay.js) — it renders Razorpay's real
  // method-selection screen (cards/netbanking/wallets/UPI) instead of
  // jumping straight into a single UPI app.
  async function payNow() {
    setPayError('')
    setPaying(true)
    try {
      const order = await createOrder.mutateAsync(couponResult?.code)
      if (order.mock) {
        await confirmMockPayment.mutateAsync(order.orderId)
        return
      }

      let result
      try {
        result = await openRazorpayCheckout(order)
      } catch (err) {
        // code 0 is Razorpay's own "user closed the checkout" cancellation —
        // everything else is a real payment failure, worth a distinct message.
        setPayError(err.code === 0 ? 'Payment cancelled' : err.description || 'Payment failed. Please try again.')
        return
      }

      await verifyPayment.mutateAsync({
        razorpay_order_id: result.razorpay_order_id,
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_signature: result.razorpay_signature,
      })
    } catch (err) {
      setPayError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  const teal = colors.navy
  const sectionTitle = { color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20, letterSpacing: -0.3 }
  const Cell = ({ value, premium }) =>
    value === true ? (
      <Feather name="check" size={16} color={premium ? teal : colors.inkSecondary} />
    ) : value === false ? (
      <Feather name="minus" size={16} color={colors.borderStrong} />
    ) : (
      <Text style={{ color: premium ? colors.ink : colors.inkSecondary, fontFamily: premium ? fontFamily.medium : fontFamily.regular, fontSize: 13, flexShrink: 1 }}>{value}</Text>
    )

  return (
    <ScreenContainer onRefresh={refetch} refreshing={isRefetching}>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 26, lineHeight: 31, letterSpacing: -0.5 }}>Choose how you want to grow</Text>
      <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 14.5, lineHeight: 21, marginTop: 8, marginBottom: spacing.lg }}>
        Start free with {plan.basic.name}. Upgrade to {plan.premium.name} to get unlimited applications and hands-on support from our team, from your CV to your final offer.
      </Text>

      {/* Premium */}
      <View style={{ borderRadius: 14, borderWidth: 2, borderColor: teal, backgroundColor: colors.surface, padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
            <Feather name="star" size={17} color={teal} />
            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 17 }}>{plan.premium.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.navyTint }}>
            {isPaid ? <Feather name="shield" size={12} color={teal} /> : null}
            <Text style={{ color: teal, fontFamily: fontFamily.semibold, fontSize: 12 }}>{isPaid ? 'Active' : 'One-time payment'}</Text>
          </View>
        </View>

        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          {!isPaid && couponResult ? (
            <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 16, textDecorationLine: 'line-through' }}>₹{fee}</Text>
          ) : null}
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 34, letterSpacing: -0.6 }}>₹{!isPaid && couponResult ? couponResult.finalAmount : fee}</Text>
        </View>
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13 }}>
          {isPaid ? `Paid once${subscription.paidOn ? ` on ${fmtDate(subscription.paidOn)}` : ''} · valid for life` : 'Paid once, valid for life. No renewals.'}
        </Text>

        <View style={{ marginTop: 16, gap: 10 }}>
          {PREMIUM_POINTS.map((t) => (
            <View key={t} style={{ flexDirection: 'row', gap: 8 }}>
              <Feather name="check" size={16} color={teal} style={{ marginTop: 2 }} />
              <Text style={{ flex: 1, color: colors.ink, fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20 }}>{t}</Text>
            </View>
          ))}
        </View>

        {!isPaid ? (
          <View style={{ marginTop: 20 }}>
            <Button title={paying ? 'Processing…' : `Upgrade for ₹${couponResult?.finalAmount ?? fee}`} loading={paying} disabled={paying} onPress={payNow} />
            <View style={{ marginTop: 12 }}>
              <CouponBox applied={couponResult} onApply={setCouponResult} onRemove={() => setCouponResult(null)} />
            </View>
            {payError ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 13, marginTop: 8 }}>{payError}</Text> : null}
          </View>
        ) : null}
      </View>

      {/* Basic */}
      <View style={{ marginTop: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 17 }}>{plan.basic.name}</Text>
          {!isPaid ? (
            <View style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 12 }}>Your plan</Text>
            </View>
          ) : null}
        </View>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 34, letterSpacing: -0.6, marginTop: 8 }}>₹0</Text>
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13 }}>Free, no card needed</Text>
        <View style={{ marginTop: 14, gap: 10 }}>
          {BASIC_POINTS.map((p) => {
            const t = typeof p === 'function' ? p(limit) : p
            return (
              <View key={t} style={{ flexDirection: 'row', gap: 8 }}>
                <Feather name="check" size={16} color={colors.inkSecondary} style={{ marginTop: 2 }} />
                <Text style={{ flex: 1, color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20 }}>{t}</Text>
              </View>
            )
          })}
        </View>
        {!isPaid ? (
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12.5 }}>Applications used</Text>
              <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>{used} of {limit}</Text>
            </View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surfaceSunken, marginTop: 6, overflow: 'hidden' }}>
              <View style={{ height: 6, borderRadius: 3, width: `${Math.min(100, (applications.length / limit) * 100)}%`, backgroundColor: applications.length >= limit ? colors.red : teal }} />
            </View>
            {applications.length >= limit ? (
              <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 6 }}>You've used every free application. Premium removes the limit.</Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* What Premium includes */}
      <View style={{ marginTop: 32 }}>
        <Text style={sectionTitle}>{isPaid ? 'Your Premium services' : 'What Premium services include'}</Text>
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 4 }}>
          {isPaid ? 'Everything below is included with your plan.' : 'Hands-on help from the Mzobs team, included once you upgrade.'}
        </Text>
        <CategoryTabs categories={SERVICE_CATEGORIES} value={category} onChange={setCategory} colors={colors} fontFamily={fontFamily} />
        <View style={{ marginTop: 12, gap: 10 }}>
          {shown.map((s) => (
            <View key={s.key} style={{ borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 16, flexDirection: 'row', gap: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navyTint }}>
                <Feather name={isPaid ? 'check-circle' : 'lock'} size={16} color={teal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14.5 }}>{s.label}</Text>
                <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 19, marginTop: 3 }}>{s.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Compare plans */}
      <View style={{ marginTop: 32 }}>
        <Text style={sectionTitle}>Compare plans</Text>
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 4 }}>
          Everything in {plan.basic.name} and {plan.premium.name}, side by side.
        </Text>
        <View style={{ marginTop: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' }}>
          {plan.groups.map((g, gi) => {
            const open = openGroups.includes(g.key)
            return (
              <View key={g.key} style={{ borderTopWidth: gi === 0 ? 0 : 1, borderTopColor: colors.border }}>
                <Pressable
                  onPress={() => setOpenGroups((o) => (o.includes(g.key) ? o.filter((k) => k !== g.key) : [...o, g.key]))}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.bg }}
                >
                  <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14.5 }}>{g.label}</Text>
                  <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12.5 }}>{g.features.length}</Text>
                  <Feather name={open ? 'chevron-up' : 'chevron-down'} size={17} color={colors.inkTertiary} style={{ marginLeft: 'auto' }} />
                </Pressable>
                {open
                  ? g.features.map((f) => (
                      <View key={f.label} style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingVertical: 12, gap: 6 }}>
                        <Text style={{ color: colors.ink, fontFamily: fontFamily.medium, fontSize: 14 }}>{f.label}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                          <Text style={{ width: 62, color: colors.inkTertiary, fontFamily: fontFamily.semibold, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', paddingTop: 2 }}>Basic</Text>
                          <Cell value={f.basic} />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                          <Text style={{ width: 62, color: teal, fontFamily: fontFamily.semibold, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', paddingTop: 2 }}>Premium</Text>
                          <Cell value={f.premium} premium />
                        </View>
                      </View>
                    ))
                  : null}
              </View>
            )
          })}
        </View>
      </View>

      {/* Never charged + payment history */}
      <View style={{ marginTop: 32, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 20 }}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 16 }}>You're never charged for</Text>
        <View style={{ marginTop: 12, gap: 12 }}>
          {NEVER_CHARGED.map(([t, b]) => (
            <View key={t} style={{ flexDirection: 'row', gap: 8 }}>
              <Feather name="check" size={16} color={teal} style={{ marginTop: 2 }} />
              <Text style={{ flex: 1, color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20 }}>
                <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold }}>{t}. </Text>
                {b}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ marginTop: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 20 }}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 16 }}>Payment history</Text>
        {isPaid ? (
          <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.ink, fontFamily: fontFamily.medium, fontSize: 14 }}>{plan.premium.name}, one-time fee</Text>
              <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13 }}>{fmtDate(subscription.paidOn)}</Text>
            </View>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 14 }}>₹{fee}</Text>
            <View style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.navyTint }}>
              <Text style={{ color: teal, fontFamily: fontFamily.semibold, fontSize: 12 }}>Paid</Text>
            </View>
          </View>
        ) : (
          <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 10 }}>No payment recorded yet.</Text>
        )}
      </View>
    </ScreenContainer>
  )
}

function CategoryTabs({ categories, value, onChange, colors, fontFamily }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14, flexGrow: 0 }} contentContainerStyle={{ gap: 8 }}>
      {categories.map((c) => {
        const active = c.key === value
        return (
          <Pressable
            key={c.key}
            onPress={() => onChange(c.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={{
              height: 38,
              paddingHorizontal: 14,
              borderRadius: 999,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: active ? colors.navy : colors.surface,
              borderWidth: 1,
              borderColor: active ? colors.navy : colors.border,
            }}
          >
            <Feather name={c.icon} size={14} color={active ? '#fff' : colors.inkSecondary} />
            <Text style={{ color: active ? '#fff' : colors.ink, fontFamily: fontFamily.medium, fontSize: 13.5 }}>{c.label}</Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
