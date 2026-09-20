import { View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import Card from './Card'
import Button from './Button'

// Shown in place of a page gated behind the one-time ₹99 placement-support
// payment — Resume Center routes here instead of
// duplicating the same lock screen. Mirrors Website/Frontend's PaymentLock.
export default function PaymentLock({ title, body, fee = 99, navigation }) {
  const { colors, spacing, fontFamily, radius } = useTheme()
  return (
    <Card style={{ alignItems: 'center', paddingVertical: spacing.xxl, marginTop: spacing.lg }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: radius.xl,
          backgroundColor: colors.navyTint,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.md,
        }}
      >
        <Feather name="lock" size={24} color={colors.navy} />
      </View>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 17, textAlign: 'center' }}>{title}</Text>
      <Text
        style={{
          color: colors.inkSecondary,
          fontFamily: fontFamily.regular,
          fontSize: 13,
          marginTop: spacing.sm,
          textAlign: 'center',
          lineHeight: 19,
        }}
      >
        {body}
      </Text>
      <Button
        title={`Pay ₹${fee} & activate`}
        variant="gold"
        onPress={() => navigation.navigate('Subscription')}
        style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
      />
    </Card>
  )
}
