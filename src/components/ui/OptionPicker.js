import { useEffect, useMemo, useState } from 'react'
import { View, Text, Pressable, Modal, FlatList, TextInput } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

// Searchable bottom-sheet list. multi=true keeps the sheet open and toggles
// items; multi=false picks one and closes. allowCustom offers the typed text
// as an extra row when it isn't in the list.
export default function OptionPicker({ visible, title, options, selected = [], multi = false, allowCustom = false, initialQuery = '', onSelect, onClose }) {
  const { colors, radius, spacing, fontFamily } = useTheme()
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (visible) setQuery(initialQuery)
  }, [visible, initialQuery])

  const q = query.trim()
  const results = useMemo(() => {
    const lower = q.toLowerCase()
    const list = lower ? options.filter((o) => o.toLowerCase().includes(lower)) : options
    const exact = options.some((o) => o.toLowerCase() === lower)
    return allowCustom && q && !exact ? [...list, q] : list
  }, [options, q, allowCustom])

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable
          onPress={() => {}}
          style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, height: '75%', paddingBottom: spacing.xl }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, paddingBottom: spacing.sm }}>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 16 }}>{title}</Text>
            {multi ? (
              <Pressable onPress={onClose} hitSlop={8}>
                <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 15 }}>Done</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Type to search…"
              placeholderTextColor={colors.inkTertiary}
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
              <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13.5, padding: spacing.lg }}>No matches.</Text>
            }
            renderItem={({ item }) => {
              const active = selected.includes(item)
              const custom = allowCustom && q && item === q && !options.includes(item)
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item)
                    if (!multi) onClose()
                    else if (custom) setQuery('')
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 13,
                    paddingHorizontal: spacing.lg,
                    backgroundColor: active ? colors.navyTint : 'transparent',
                  }}
                >
                  <Text style={{ color: active ? colors.navy : colors.ink, fontFamily: active ? fontFamily.semibold : fontFamily.regular, fontSize: 15 }}>
                    {custom ? `Add "${item}"` : item}
                  </Text>
                  {active ? <Feather name="check" size={16} color={colors.navy} /> : null}
                </Pressable>
              )
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  )
}
