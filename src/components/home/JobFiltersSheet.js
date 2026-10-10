import { useRef, useState } from 'react'
import { View, Text, Pressable, ScrollView, Modal, PanResponder } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import {
  DEFAULT_FILTERS,
  DEPARTMENT_OPTIONS,
  MAX_EXPERIENCE,
  POSTED_OPTIONS,
  SALARY_OPTIONS,
  SORT_OPTIONS,
  WORK_MODE_OPTIONS,
  facetCount,
  jobTypeOptions,
  locationOptions,
  normalizeFilters,
  toggleFilterValue,
} from '../../lib/jobFilters'

// The Home feed's filter panel — mirrors the website's job-filter drawer: a
// "Filters" header with a close button, collapsible groups of checkbox rows
// with live counts (an option with no matching jobs is dimmed unless already
// picked), an "or match my experience" slider, and a sticky "Show N jobs"
// button. Changes apply to the feed immediately; the button just closes.
const EXPERIENCE_BANDS = [
  { id: 0, label: 'Fresher · 0–1 years' },
  { id: 2, label: '1–3 years' },
  { id: 4, label: '3–5 years' },
  { id: 7, label: '5–10 years' },
  { id: 10, label: '10+ years' },
]

function Checkbox({ checked, radio }) {
  const { colors } = useTheme()
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: radio ? 11 : 6,
        borderWidth: 1.5,
        borderColor: checked ? colors.navy : colors.borderStrong,
        backgroundColor: checked ? colors.navy : colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {checked ? radio ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} /> : <Feather name="check" size={14} color="#fff" /> : null}
    </View>
  )
}

function Option({ label, count, checked, radio, onPress }) {
  const { colors, fontFamily } = useTheme()
  const disabled = count === 0 && !checked
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={radio ? 'radio' : 'checkbox'}
      accessibilityState={{ checked, disabled }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, opacity: disabled ? 0.45 : 1 }}
    >
      <Checkbox checked={checked} radio={radio} />
      <Text style={{ flex: 1, color: colors.ink, fontFamily: checked ? fontFamily.semibold : fontFamily.medium, fontSize: 15 }} numberOfLines={1}>
        {label}
      </Text>
      {count != null ? <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.medium, fontSize: 13 }}>{count}</Text> : null}
    </Pressable>
  )
}

function Group({ title, open, onToggle, children, last }) {
  const { colors, fontFamily } = useTheme()
  return (
    <View style={{ borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.border, paddingVertical: 4 }}>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded: open }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 }}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 17 }}>{title}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.inkSecondary} />
      </Pressable>
      {open ? <View style={{ paddingBottom: 10 }}>{children}</View> : null}
    </View>
  )
}

// Drag-to-set slider (0–MAX_EXPERIENCE years) without an extra native dep.
function ExperienceSlider({ value, onChange }) {
  const { colors, fontFamily } = useTheme()
  const [width, setWidth] = useState(0)
  const widthRef = useRef(0)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const set = (x) => {
    if (!widthRef.current) return
    const ratio = Math.max(0, Math.min(1, x / widthRef.current))
    onChangeRef.current(Math.round(ratio * MAX_EXPERIENCE))
  }
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => set(e.nativeEvent.locationX),
      onPanResponderMove: (e) => set(e.nativeEvent.locationX),
    }),
  ).current
  const pct = value == null ? 0 : (value / MAX_EXPERIENCE) * 100
  const KNOB = 22

  return (
    <View style={{ borderRadius: 14, backgroundColor: colors.bg, padding: 16, marginTop: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 15 }}>Or match my experience</Text>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 15 }}>{value == null ? 'Any' : `${value} ${value === 1 ? 'yr' : 'yrs'}`}</Text>
      </View>
      <View
        {...pan.panHandlers}
        onLayout={(e) => {
          widthRef.current = e.nativeEvent.layout.width
          setWidth(e.nativeEvent.layout.width)
        }}
        style={{ height: 40, justifyContent: 'center', marginTop: 4 }}
        accessibilityRole="adjustable"
        accessibilityLabel="Years of experience"
        accessibilityValue={{ min: 0, max: MAX_EXPERIENCE, now: value ?? 0 }}
      >
        <View pointerEvents="none" style={{ height: 6, borderRadius: 3, backgroundColor: colors.border }}>
          <View style={{ width: `${pct}%`, height: 6, borderRadius: 3, backgroundColor: colors.navy }} />
        </View>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: Math.max(0, (width * pct) / 100 - KNOB / 2),
            width: KNOB,
            height: KNOB,
            borderRadius: KNOB / 2,
            backgroundColor: colors.navy,
            borderWidth: 3,
            borderColor: colors.surface,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13 }}>0</Text>
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13 }}>Drag to set</Text>
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13 }}>{MAX_EXPERIENCE}+</Text>
      </View>
    </View>
  )
}

export default function JobFiltersSheet({ visible, onClose, filters, query, jobs, resultCount, onChange }) {
  const { colors, spacing, fontFamily } = useTheme()
  const f = normalizeFilters(filters)
  const [openGroups, setOpenGroups] = useState(['workMode', 'experience', 'location'])
  const toggleGroup = (id) => setOpenGroups((o) => (o.includes(id) ? o.filter((g) => g !== id) : [...o, id]))
  const count = (group, id) => facetCount(jobs, f, group, id, query)
  const multi = (group, id) => onChange(toggleFilterValue(f, group, id))
  const hasFilters = JSON.stringify(f) !== JSON.stringify(DEFAULT_FILTERS)
  const locations = locationOptions(jobs)
  const jobTypes = jobTypeOptions(jobs)

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Pressable style={{ width: 28, backgroundColor: 'rgba(15,23,42,0.45)' }} onPress={onClose} accessibilityLabel="Close filters" />
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top', 'bottom', 'right']}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }}>Filters</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              {hasFilters ? (
                <Pressable onPress={() => onChange({ ...DEFAULT_FILTERS })} accessibilityRole="button" hitSlop={8}>
                  <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 14 }}>Clear all</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
                <Feather name="x" size={24} color={colors.ink} />
              </Pressable>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            <Group title="Work mode" open={openGroups.includes('workMode')} onToggle={() => toggleGroup('workMode')}>
              {WORK_MODE_OPTIONS.map((o) => (
                <Option key={o.id} label={o.label} count={count('workMode', o.id)} checked={f.workMode.includes(o.id)} onPress={() => multi('workMode', o.id)} />
              ))}
            </Group>

            <Group title="Experience" open={openGroups.includes('experience')} onToggle={() => toggleGroup('experience')}>
              {EXPERIENCE_BANDS.map((o) => (
                <Option key={o.id} label={o.label} count={count('experience', o.id)} checked={f.experience === o.id} radio onPress={() => onChange({ ...f, experience: f.experience === o.id ? null : o.id })} />
              ))}
              <ExperienceSlider value={f.experience} onChange={(v) => onChange({ ...f, experience: v })} />
            </Group>

            {locations.length > 0 ? (
              <Group title="Location" open={openGroups.includes('location')} onToggle={() => toggleGroup('location')}>
                {locations.map((o) => (
                  <Option key={o.id} label={o.label} count={count('location', o.id)} checked={f.location.includes(o.id)} onPress={() => multi('location', o.id)} />
                ))}
              </Group>
            ) : null}

            <Group title="Salary" open={openGroups.includes('salary')} onToggle={() => toggleGroup('salary')}>
              {SALARY_OPTIONS.map((o) => (
                <Option key={o.id} label={o.label} count={count('salary', o.id)} checked={f.salary.includes(o.id)} onPress={() => multi('salary', o.id)} />
              ))}
            </Group>

            <Group title="Department" open={openGroups.includes('category')} onToggle={() => toggleGroup('category')}>
              {DEPARTMENT_OPTIONS.map((o) => (
                <Option key={o.id} label={o.label} count={count('category', o.id)} checked={f.category.includes(o.id)} onPress={() => multi('category', o.id)} />
              ))}
            </Group>

            {jobTypes.length > 0 ? (
              <Group title="Job type" open={openGroups.includes('jobType')} onToggle={() => toggleGroup('jobType')}>
                {jobTypes.map((o) => (
                  <Option key={o.id} label={o.label} count={count('jobType', o.id)} checked={f.jobType.includes(o.id)} onPress={() => multi('jobType', o.id)} />
                ))}
              </Group>
            ) : null}

            <Group title="Date posted" open={openGroups.includes('posted')} onToggle={() => toggleGroup('posted')}>
              {POSTED_OPTIONS.map((o) => (
                <Option key={o.id} label={o.label} count={o.id === 'any' ? null : count('posted', o.id)} checked={f.posted === o.id} radio onPress={() => onChange({ ...f, posted: o.id })} />
              ))}
            </Group>

            <Group title="Sort by" open={openGroups.includes('sort')} onToggle={() => toggleGroup('sort')} last>
              {SORT_OPTIONS.map((o) => (
                <Option key={o.id} label={o.label} checked={f.sort === o.id} radio onPress={() => onChange({ ...f, sort: o.id })} />
              ))}
            </Group>
          </ScrollView>

          <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }}>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              style={{ height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy }}
            >
              <Text style={{ color: '#fff', fontFamily: fontFamily.bold, fontSize: 16 }}>
                Show {resultCount} {resultCount === 1 ? 'job' : 'jobs'}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}
