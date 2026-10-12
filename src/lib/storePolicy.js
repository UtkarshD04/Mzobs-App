import { Platform } from 'react-native'

// App Store Guideline 3.1.1: on iOS, anything that unlocks digital features in the app must be
// sold through Apple's In-App Purchase. Premium is paid for outside it (Razorpay) under 3.1.3(d),
// which only covers one-to-one services delivered by people (CV review, mock interviews,
// coaching). So on iOS the app sells and talks about those services only — never the digital
// perks (application cap, application tracking, urgent jobs, wider job picks), and never links a
// "Upgrade" button to them. Android and the website are unchanged.
export const IOS_SERVICES_ONLY = Platform.OS === 'ios'
