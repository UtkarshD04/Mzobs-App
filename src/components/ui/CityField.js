import { useMemo, useState } from 'react'
import { View, Text, Pressable, Modal, FlatList, TextInput } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { searchCities } from '../../lib/indianCities'

// Type-ahead city picker. Selecting a city calls onSelectCity(city, state)
// so the caller can auto-fill "State" alongside "Current city".
export default function CityField({ label = 'Current city', value, onSelectCity, placeholder = 'Search for a city', error }) {
  const { colors, radius, spacing, fontFamily } = useTheme()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchCities(query), [query])

  function openModal() {
    setQuery('')
    setOpen(true)
  }

  function pick(city) {
    onSelectCity(city)
    setOpen(false)
  }

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? (
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5, marginBottom: 6 }}>{label}</Text>
      ) : null}
      <Pressable
        onPress={openModal}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: error ? colors.red : colors.border,
          borderRadius: radius.sm,
          paddingVertical: 11,
          paddingHorizontal: spacing.md,
          backgroundColor: colors.surface,
        }}
      >
        <Text style={{ color: value ? colors.ink : colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 15 }}>
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.inkTertiary} />
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
              maxHeight: '75%',
              paddingBottom: spacing.xl,
            }}
          >
            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 16, padding: spacing.lg, paddingBottom: spacing.sm }}>
              {label}
            </Text>
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Type to search…"
                placeholderTextColor={colors.inkTertiary}
                autoFocus
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.sm,
                  paddingVertical: 10,
                  paddingHorizontal: spacing.md,
                  color: colors.ink,
                  fontFamily: fontFamily.regular,
                  fontSize: 15,
                  backgroundColor: colors.bg,
                }}
              />
            </View>
            <FlatList
              data={results}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13.5, padding: spacing.lg }}>
                  No matching city. You can still type it as your preferred location elsewhere.
                </Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => pick(item)}
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
