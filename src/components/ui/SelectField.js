import { useState } from 'react'
import { View, Text, Pressable, Modal, FlatList } from 'react-native'
import { useTheme } from '../../theme'

export default function SelectField({ label, value, onChange, options, placeholder = 'Select an option', error }) {
  const { colors, radius, spacing, fontFamily } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? (
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5, marginBottom: 6 }}>{label}</Text>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          borderWidth: 1,
          borderColor: error ? colors.red : colors.border,
          borderRadius: radius.md,
          paddingVertical: 11,
          paddingHorizontal: spacing.md,
          backgroundColor: colors.surface,
        }}
      >
        <Text style={{ color: value ? colors.ink : colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 15 }}>
          {value || placeholder}
        </Text>
      </Pressable>
      {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 4 }}>{error}</Text> : null}

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} onPress={() => setOpen(false)}>
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              maxHeight: '70%',
              paddingBottom: spacing.xl,
            }}
          >
            {label ? (
              <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 16, padding: spacing.lg, paddingBottom: spacing.sm }}>
                {label}
              </Text>
            ) : null}
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item)
                    setOpen(false)
                  }}
                  style={{
                    paddingVertical: 13,
                    paddingHorizontal: spacing.lg,
                    backgroundColor: item === value ? colors.navyTint : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      color: item === value ? colors.navy : colors.ink,
                      fontFamily: item === value ? fontFamily.semibold : fontFamily.regular,
                      fontSize: 15,
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
