import { useState } from 'react'
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useAuth } from '../context/AuthContext'
import { useCompleteProfileMutation, useProfileQuery } from '../hooks/useProfile'
import { profileCompletionDetail } from '../lib/dashboard'
import {
  STEPS,
  EMPTY_FORM,
  INTEREST_OPTIONS,
  LOCATION_SUGGESTIONS,
  SKILL_SUGGESTIONS,
  NOTICE_OPTIONS,
  GENDER_OPTIONS,
  MARITAL_OPTIONS,
  YEAR_OPTIONS,
  MONTH_OPTIONS,
  SALARY_OPTIONS,
  validateStep,
  buildPayload,
} from '../lib/profileSetup'
import TextField from '../components/ui/TextField'
import SelectField from '../components/ui/SelectField'
import CityField from '../components/ui/CityField'
import { stateForCity } from '../lib/indianCities'
import FilterChip from '../components/ui/FilterChip'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import Tag from '../components/ui/Tag'

function Label({ children }) {
  const { colors, fontFamily } = useTheme()
  return <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5, marginBottom: 6 }}>{children}</Text>
}

function Chips({ options, values, onToggle }) {
  const { spacing } = useTheme()
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {options.map((o) => (
        <FilterChip key={o} label={o} active={values.includes(o)} onPress={() => onToggle(o)} />
      ))}
    </View>
  )
}

function TagListEditor({ label, values, onChange, placeholder, suggestions }) {
  const { colors, radius, spacing } = useTheme()
  const [draft, setDraft] = useState('')
  function add(v) {
    const t = v.trim()
    if (!t || values.includes(t)) return
    onChange([...values, t])
    setDraft('')
  }
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Label>{label}</Label>
      {values.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm }}>
          {values.map((v) => (
            <Pressable key={v} onPress={() => onChange(values.filter((x) => x !== v))} hitSlop={4} accessibilityLabel={`Remove ${v}`}>
              <Tag label={`${v}  ✕`} />
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <TextField value={draft} onChangeText={setDraft} placeholder={placeholder} onSubmitEditing={() => add(draft)} returnKeyType="done" style={{ marginBottom: 0 }} />
        </View>
        <Pressable
          onPress={() => add(draft)}
          accessibilityLabel={`Add ${label}`}
          style={{ width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.navyTint, alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="plus" size={18} color={colors.navy} />
        </Pressable>
      </View>
      {suggestions?.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }}>
          {suggestions
            .filter((s) => !values.includes(s))
            .map((s) => (
              <FilterChip key={s} label={s} active={false} onPress={() => add(s)} />
            ))}
        </View>
      ) : null}
    </View>
  )
}

export default function ProfileSetupScreen({ onSkip }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { logout } = useAuth()
  const complete = useCompleteProfileMutation()
  const { data: profile } = useProfileQuery()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))
  const toggle = (key) => (item) =>
    setForm((f) => ({ ...f, [key]: f[key].includes(item) ? f[key].filter((x) => x !== item) : [...f[key], item] }))
  const last = step === STEPS.length - 1
  // Real completion: the saved profile overlaid with everything typed so far.
  const { percent, missing } = profileCompletionDetail({ ...profile, ...buildPayload(form) })
  const experienced = form.experience === 'experienced'

  async function next() {
    const problem = validateStep(step, form)
    setError(problem)
    if (problem) return
    if (!last) return setStep((s) => s + 1)
    try {
      await complete.mutateAsync(buildPayload(form))
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not save your profile. Please try again.')
    }
  }

  const heading = { color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }
  const sub = { color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, marginTop: 4, marginBottom: spacing.lg }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 15 }}>Profile {percent}% complete</Text>
            <Pressable onPress={logout} hitSlop={8}>
              <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.medium, fontSize: 12 }}>Log out</Text>
            </Pressable>
          </View>
          <ProgressBar value={percent} tone={percent === 100 ? 'green' : 'navy'} style={{ marginTop: spacing.sm }} />
          <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5, marginTop: 6 }}>
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
            {missing.length ? ` · Still to add: ${missing.slice(0, 2).map((m) => m.label.toLowerCase()).join(', ')}${missing.length > 2 ? '…' : ''}` : ''}
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.md }} keyboardShouldPersistTaps="handled">
          {step === 0 ? (
            <>
              <Text style={heading}>Payment successful. Complete your profile</Text>
              <Text style={sub}>Your placement support is active. Fill in your details once so recruiters can match you. You can skip for now and finish it later from your Profile.</Text>
              <Label>Are you currently working?</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }}>
                <FilterChip label="Fresher / Student" active={!experienced} onPress={() => set('experience')('fresher')} />
                <FilterChip label="Experienced professional" active={experienced} onPress={() => set('experience')('experienced')} />
              </View>
              {experienced ? (
                <>
                  <TextField label="Current or latest company" value={form.currentCompany} onChangeText={set('currentCompany')} placeholder="e.g. TCS" />
                  <TextField label="Designation" value={form.designation} onChangeText={set('designation')} placeholder="e.g. Business Analyst" />
                  <SelectField label="Total experience (years)" value={form.years} onChange={set('years')} options={YEAR_OPTIONS} />
                  <SelectField label="Total experience (months)" value={form.months} onChange={set('months')} options={MONTH_OPTIONS} />
                  <TextField label="Current annual CTC in rupees (optional)" value={form.currentCtc} onChangeText={set('currentCtc')} placeholder="e.g. 6,00,000" keyboardType="numbers-and-punctuation" />
                  <SelectField label="Notice period" value={form.noticePeriod} onChange={set('noticePeriod')} options={NOTICE_OPTIONS} />
                </>
              ) : null}
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Text style={heading}>Education</Text>
              <Text style={sub}>Your highest qualification.</Text>
              <TextField label="Degree or course" value={form.degree} onChangeText={set('degree')} placeholder="e.g. B.Com" />
              <TextField label="Institute" value={form.institute} onChangeText={set('institute')} placeholder="College or university" />
              <TextField label="Year of passing" value={form.year} onChangeText={set('year')} placeholder="e.g. 2024" keyboardType="number-pad" maxLength={4} />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Text style={heading}>Personal details</Text>
              <Text style={sub}>Kept private. Recruiters see them only if Mzobs shares your profile.</Text>
              <TextField label="Date of birth" value={form.dob} onChangeText={set('dob')} placeholder="YYYY-MM-DD, e.g. 2001-08-24" keyboardType="numbers-and-punctuation" maxLength={10} />
              <SelectField label="Gender" value={form.gender} onChange={set('gender')} options={GENDER_OPTIONS} />
              <SelectField label="Marital status (optional)" value={form.maritalStatus} onChange={set('maritalStatus')} options={MARITAL_OPTIONS} />
            </>
          ) : null}

          {step === 3 ? (
            <>
              <Text style={heading}>Where are you based?</Text>
              <Text style={sub}>Helps us match on-site and hybrid roles near you.</Text>
              <CityField
                value={form.currentCity}
                onSelectCity={(city) => {
                  set('currentCity')(city)
                  const state = stateForCity(city)
                  if (state) set('state')(state === 'Remote' ? '' : state)
                }}
              />
              <TextField label="State" value={form.state} onChangeText={set('state')} placeholder="Auto-filled from city, or type your own" />
              <TextField label="Pincode" value={form.pincode} onChangeText={(v) => set('pincode')(v.replace(/\D/g, ''))} placeholder="6 digits" keyboardType="number-pad" maxLength={6} />
              <Label>Willing to relocate?</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                <FilterChip label="Yes, open to relocating" active={form.relocationOk} onPress={() => set('relocationOk')(true)} />
                <FilterChip label="No, only my city" active={!form.relocationOk} onPress={() => set('relocationOk')(false)} />
              </View>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <Text style={heading}>Your career goals</Text>
              <Text style={sub}>This shapes the jobs we recommend.</Text>
              <TextField label="Preferred role" value={form.preferredRole} onChangeText={set('preferredRole')} placeholder="e.g. Business Analyst" />
              <Label>Areas you are interested in</Label>
              <View style={{ marginBottom: spacing.md }}>
                <Chips options={INTEREST_OPTIONS} values={form.interests} onToggle={toggle('interests')} />
              </View>
              <TagListEditor label="Preferred locations" values={form.preferredLocations} onChange={set('preferredLocations')} placeholder="Add a city" suggestions={LOCATION_SUGGESTIONS} />
              <SelectField label="Expected annual salary (optional)" value={form.salary} onChange={set('salary')} options={SALARY_OPTIONS} />
            </>
          ) : null}

          {step === 5 ? (
            <>
              <Text style={heading}>Skills and headline</Text>
              <Text style={sub}>Last step. Then you can upload your resume.</Text>
              <TagListEditor label="Key skills" values={form.skills} onChange={set('skills')} placeholder="Type a skill" suggestions={SKILL_SUGGESTIONS} />
              <TextField label="Resume headline" value={form.resumeHeadline} onChangeText={set('resumeHeadline')} placeholder="e.g. Aspiring analyst | SQL, Excel" />
              <TextField label="Portfolio link (optional)" value={form.portfolioLink} onChangeText={set('portfolioLink')} autoCapitalize="none" autoCorrect={false} keyboardType="url" />
              <TextField label="LinkedIn (optional)" value={form.linkedin} onChangeText={set('linkedin')} autoCapitalize="none" autoCorrect={false} />
              <TextField label="GitHub (optional)" value={form.github} onChangeText={set('github')} autoCapitalize="none" autoCorrect={false} />
            </>
          ) : null}

          {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 13, marginTop: spacing.sm }}>{error}</Text> : null}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }}>
          {step > 0 ? (
            <Button
              title="Back"
              variant="secondary"
              disabled={complete.isPending}
              onPress={() => {
                setError('')
                setStep((s) => s - 1)
              }}
              style={{ flex: 1 }}
            />
          ) : null}
          <Button title={last ? 'Finish profile' : 'Continue'} loading={complete.isPending} onPress={next} style={{ flex: 2 }} />
        </View>
        {onSkip ? (
          <Pressable
            onPress={onSkip}
            disabled={complete.isPending}
            accessibilityRole="button"
            accessibilityLabel="Skip profile setup for now"
            style={{ alignItems: 'center', paddingBottom: spacing.md, paddingTop: 2, backgroundColor: colors.surface }}
          >
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 13.5, paddingVertical: spacing.sm }}>
              Skip for now
            </Text>
          </Pressable>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
