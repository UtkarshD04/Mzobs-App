import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import TextField from './TextField'
import Button from './Button'
import { usePreviewCouponMutation } from '../../hooks/useSubscription'

// Mirrors Website/Frontend/src/components/ui/CouponBox.jsx — previews a
// discount against the fixed subscription fee before the order is created.
export default function CouponBox({ applied, onApply, onRemove }) {
  const { colors, spacing, fontFamily, radius } = useTheme()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const preview = usePreviewCouponMutation()

  function apply() {
    const trimmed = code.trim()
    if (!trimmed) return
    setError('')
    preview.mutate(trimmed, {
      onSuccess: (data) => onApply(data),
      onError: (err) => setError(err.response?.data?.message ?? 'Invalid coupon code'),
    })
  }

  if (applied) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.greenTint,
          borderRadius: radius.md,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 }}>
          <Feather name="check-circle" size={15} color={colors.green} />
          <Text style={{ color: colors.green, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>
            {applied.code} applied — ₹{applied.discountAmount} off
          </Text>
        </View>
        <Pressable onPress={onRemove} hitSlop={10}>
          <Feather name="x" size={16} color={colors.inkTertiary} />
        </Pressable>
      </View>
    )
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
        <TextField
          style={{ flex: 1, marginBottom: 0 }}
          placeholder="Have a coupon code?"
          value={code}
          onChangeText={(v) => {
            setCode(v.toUpperCase())
            setError('')
          }}
          autoCapitalize="characters"
        />
        <Button
          title={preview.isPending ? '...' : 'Apply'}
          variant="secondary"
          onPress={apply}
          disabled={preview.isPending || !code.trim()}
          style={{ marginTop: 0 }}
        />
      </View>
      {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
    </View>
  )
}
