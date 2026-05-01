import { FC, useRef, useEffect } from "react";
import { Animated, View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { ALL_JOBS, C } from ".";


const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SuccessScreen: FC<{ navigation:any }> = ({ navigation}) => {
  const scale = useRef(new Animated.Value(0)).current
  const job = ALL_JOBS[0];
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }).start()
  }, [])

  return (
    <View style={s.successScreen}>
      <Animated.View style={[s.successCircle, { transform: [{ scale }] }]}>
        <Text style={s.successCheck}>✓</Text>
      </Animated.View>
      <Text style={s.successTitle}>Applied! 🎉</Text>
      <Text style={s.successSub}>
        Your application for{'\n'}
        <Text style={{ color: C.primary, fontWeight: '800' }}>{job.title}</Text>
        {'\n'}at {job.company} is submitted.
      </Text>

      <View style={s.nextStepsCard}>
        <Text style={s.nextStepsTitle}>What's next?</Text>
        {['Company reviews your profile', 'Interview invitation sent', 'Complete hiring process'].map((st, i) => (
          <View key={i} style={s.nextStep}>
            <View style={s.nextStepNum}><Text style={s.nextStepNumText}>{i + 1}</Text></View>
            <Text style={s.nextStepText}>{st}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.doneBtn} onPress={()=>{
        navigation.navigate('JobApplications')
      }}>
        <Text style={s.doneBtnText}>Browse More Jobs</Text>
      </TouchableOpacity>
    </View>
  )
}


const s = StyleSheet.create({
  // Header (compact)

  headerGreeting: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.white, letterSpacing: -0.3 },
  resumeFab2: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, gap: 6 },
  resumeFabIcon: { fontSize: 15 },
  resumeFabText: { color: C.white, fontSize: 13, fontWeight: '700' },

  // Search
 
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1.5, borderColor: C.border, gap: 8 },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  clearBtn: { color: C.textMuted, fontSize: 16, paddingRight: 4 },
  filterIconBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C.primaryMid },
  filterIconBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterDot: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.urgent },

  // Active pills
  
  activePill: { backgroundColor: C.primary, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,height:30 },
  activePillText: { color: C.white, fontSize: 12, fontWeight: '600' },

  // Results
 
  resultsText: { fontSize: 13, color: C.textSub, fontWeight: '500' },
  sortBtn: { backgroundColor: C.primaryLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  sortBtnText: { fontSize: 12, color: C.primary, fontWeight: '700' },

  // Job Card
  jobCard: {
    backgroundColor: C.card, borderRadius: 18, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  jobCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  logoCircle: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  logoText: { fontWeight: '800' },
  jobCardInfo: { flex: 1 },
  jobTitle: { fontSize: 16, fontWeight: '800', color: C.text, letterSpacing: -0.2 },
  jobCompany: { fontSize: 13, color: C.textSub, marginTop: 1 },
  matchBadge: { borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center', minWidth: 50 },
  matchText: { fontSize: 14, fontWeight: '900' },
  matchLabel: { fontSize: 9, color: C.textMuted, fontWeight: '600' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: C.border, gap: 4 },
  tagIcon: { fontSize: 10 },
  tagText: { fontSize: 11, color: C.textSub, fontWeight: '500' },
  jobCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  salaryText: { fontSize: 14, fontWeight: '800', color: C.text },
  metaText: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  badgePill: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 4 },
  badgePillText: { fontSize: 10, fontWeight: '800' },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.text, marginBottom: 6 },
  emptySub: { fontSize: 14, color: C.textSub, marginBottom: 20 },
  emptyBtn: { backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  emptyBtnText: { color: C.white, fontWeight: '700', fontSize: 14 },

  // Bottom filter bar
  
  bottomBarTab: { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 10 },
  bottomBarTabActive: { backgroundColor: C.primaryLight },
  bottomBarTabText: { fontSize: 11, fontWeight: '600', color: C.textMuted },
  bottomBarTabTextActive: { color: C.primary, fontWeight: '800' },

  // Filter sheet
  sheetOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: C.overlay },
  filterSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  sheetHandle: { width: 40, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  resetText: { fontSize: 14, color: C.primary, fontWeight: '700' },
  filterGroupLabel: { fontSize: 11, fontWeight: '800', color: C.textSub, letterSpacing: 1, marginBottom: 10 },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  filterChipLg: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 22, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border },
  filterChipLgActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterChipLgText: { fontSize: 13, color: C.text, fontWeight: '600' },
  filterChipLgTextActive: { color: C.white },
  applyFilterBtn: { backgroundColor: C.primary, borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 4 },
  applyFilterBtnText: { color: C.white, fontWeight: '800', fontSize: 15 },

  // Sticky nav
  stickyNav: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: C.glass, paddingTop: 48, paddingBottom: 12, paddingHorizontal: 70, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: C.border },
  stickyNavTitle: { fontSize: 15, fontWeight: '700', color: C.text },

  // Detail hero top row (back btn + logo)
  detailHeroTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10,zIndex:999 },
  detailBackBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center',zIndex:999 },
  detailBackText: { color: C.white, fontSize: 18, fontWeight: '700', lineHeight: 22 },
  heroLogoChip: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  heroLogoText: { fontSize: 12, fontWeight: '900' },

  // Detail Hero — compact
  detailHero: { backgroundColor: C.primary, paddingTop: 15, paddingBottom: 16, paddingHorizontal: 16 },
  detailHeroTitle: { fontSize: 20, fontWeight: '900', color: C.white, marginTop: 8, letterSpacing: -0.3 },
  detailHeroCompany: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  detailHeroLocation: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  detailHeroTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  heroPill: { borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.22)' },
  heroPillText: { fontSize: 11, color: C.white, fontWeight: '600' },

  // Stats
  statsCard: { flexDirection: 'row', backgroundColor: C.white, marginHorizontal: 16, marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statNum: { fontSize: 16, fontWeight: '900', color: C.primary },
  statLbl: { fontSize: 11, color: C.textSub, marginTop: 3 },
  statSep: { width: 1, backgroundColor: C.border },

  // Detail cards
  detailCard: { backgroundColor: C.white, marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.border },
  detailCardTitle: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 12 },
  detailCardBody: { fontSize: 14, color: C.textSub, lineHeight: 24 },
  reqRow: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
  reqBullet: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.successBg, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  reqBulletText: { fontSize: 10, color: C.success, fontWeight: '800' },
  reqText: { flex: 1, fontSize: 14, color: C.textSub, lineHeight: 22 },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillPill: { backgroundColor: C.primaryLight, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: C.primaryMid },
  skillPillText: { fontSize: 12, color: C.primary, fontWeight: '700' },

  // Detail CTA
  detailCTA: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border },
  saveJobBtn: { width: 52, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  saveJobBtnText: { fontSize: 22 },
  applyNowBtn: { flex: 1, height: 52, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  applyNowText: { color: C.white, fontWeight: '900', fontSize: 16 },

  // Apply
  applyHeader: { backgroundColor: C.primary, paddingTop: 48, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  applyBackBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  applyBackText: { color: C.white, fontSize: 20, fontWeight: '600' },
  applyHeaderTitle: { fontSize: 17, fontWeight: '800', color: C.white },
  applyHeaderSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  stepCounter: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '700' },
  progressTrack: { height: 3, backgroundColor: C.border },
  progressFill: { height: 3, backgroundColor: C.primary },
  stepLabels: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  stepLabel: { fontSize: 11, color: C.textMuted, fontWeight: '600' },
  stepLabelActive: { color: C.primary, fontWeight: '800' },
  applyFormCard: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  applyFormTitle: { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 14 },
  applyField: { marginBottom: 14 },
  applyFieldLabel: { fontSize: 10, fontWeight: '800', color: C.textSub, letterSpacing: 0.8, marginBottom: 6 },
  applyFieldInput: { borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text, backgroundColor: C.bg },
  expGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  expOpt: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg },
  expOptActive: { borderColor: C.primary, backgroundColor: C.primaryLight },
  expOptText: { fontSize: 13, color: C.textSub, fontWeight: '600' },
  expOptTextActive: { color: C.primary, fontWeight: '800' },
  resumeToggle: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  resumeToggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', backgroundColor: C.bg },
  resumeToggleBtnActive: { borderColor: C.primary, backgroundColor: C.primaryLight },
  resumeToggleText: { fontSize: 13, color: C.textSub, fontWeight: '600' },
  resumeToggleTextActive: { color: C.primary, fontWeight: '800' },
  builtinResumeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.primaryLight, borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: C.primaryMid },
  builtinResumeLeft: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.primary + '25', alignItems: 'center', justifyContent: 'center' },
  builtinResumeIcon: { fontSize: 24 },
  builtinResumeName: { fontSize: 14, fontWeight: '700', color: C.text },
  builtinResumeRole: { fontSize: 12, color: C.textSub },
  builtinResumeMeta: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  checkBubble: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.success, alignItems: 'center', justifyContent: 'center' },
  checkText: { color: C.white, fontSize: 13, fontWeight: '800' },
  uploadDropzone: { borderWidth: 2, borderStyle: 'dashed', borderColor: C.primaryMid, borderRadius: 14, padding: 28, alignItems: 'center', backgroundColor: C.primaryLight },
  uploadDropIcon: { fontSize: 34, marginBottom: 8 },
  uploadDropTitle: { fontSize: 14, fontWeight: '700', color: C.primary },
  uploadDropSub: { fontSize: 12, color: C.textMuted, marginTop: 4 },
  reviewCard: { backgroundColor: C.white, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.border },
  reviewTitle: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 16 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.borderLight },
  reviewKey: { fontSize: 12, color: C.textMuted, fontWeight: '600' },
  reviewVal: { fontSize: 13, color: C.text, fontWeight: '700', maxWidth: 200, textAlign: 'right' },
  applyNavRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  prevBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: C.primary, alignItems: 'center' },
  prevBtnText: { color: C.primary, fontWeight: '700', fontSize: 14 },
  nextBtn: { flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center' },
  nextBtnText: { color: C.white, fontWeight: '800', fontSize: 15 },
  submitBtn: { flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: C.success, alignItems: 'center' },
  submitBtnText: { color: C.white, fontWeight: '900', fontSize: 15 },

  // Success
  successScreen: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 28 },
  successCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: C.success, alignItems: 'center', justifyContent: 'center', marginBottom: 22, elevation: 8, shadowColor: C.success, shadowOpacity: 0.4, shadowRadius: 12 },
  successCheck: { color: C.white, fontSize: 48, fontWeight: '900' },
  successTitle: { fontSize: 28, fontWeight: '900', color: C.text, marginBottom: 10 },
  successSub: { fontSize: 15, color: C.textSub, textAlign: 'center', lineHeight: 24, marginBottom: 28 },
  nextStepsCard: { backgroundColor: C.white, borderRadius: 18, padding: 20, width: '100%', borderWidth: 1, borderColor: C.border, marginBottom: 24 },
  nextStepsTitle: { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 16 },
  nextStep: { flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 14 },
  nextStepNum: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' },
  nextStepNumText: { color: C.primary, fontWeight: '900', fontSize: 13 },
  nextStepText: { fontSize: 14, color: C.textSub, flex: 1 },
  doneBtn: { width: '100%', backgroundColor: C.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  doneBtnText: { color: C.white, fontWeight: '900', fontSize: 16 },

  // Resume Builder
  resumeBuilderHeader: { backgroundColor: C.primary, paddingTop: 48, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  previewMiniBtn: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  previewMiniBtnText: { color: C.white, fontSize: 13, fontWeight: '700' },
  stepTabRow: { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 10 },
  stepTabItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6,height:50 },
  stepTabItemActive: { backgroundColor: C.primaryLight },
  stepTabDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  stepTabDotCurrent: { backgroundColor: C.primary, borderColor: C.primary },
  stepTabDotDone: { backgroundColor: C.success, borderColor: C.success },
  stepTabLbl: { fontSize: 12, color: C.textSub, fontWeight: '600' },
  stepTabLblActive: { color: C.primary, fontWeight: '800' },
  builderCard: { backgroundColor: C.white, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: C.border, marginBottom: 12 },
  builderCardTitle: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 16 },
  builderField: { marginBottom: 14 },
  builderFieldLabel: { fontSize: 10, fontWeight: '800', color: C.textSub, letterSpacing: 0.8, marginBottom: 6 },
  builderFieldInput: { borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text, backgroundColor: C.bg },
  addMoreRow: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.primaryMid, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  addMoreText: { fontSize: 14, color: C.primary, fontWeight: '700' },
  templateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  templateOpt: { width: (SCREEN_WIDTH - 72) / 2, borderRadius: 14, borderWidth: 2, borderColor: C.border, padding: 14, backgroundColor: C.bg, flexDirection: 'row', alignItems: 'center', gap: 10 },
  templateOptActive: { backgroundColor: C.primaryLight, borderWidth: 2 },
  templateSwatch: { width: 28, height: 28, borderRadius: 8 },
  templateName: { flex: 1, fontSize: 14, fontWeight: '700', color: C.text },
  builderContinueBtn: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  builderContinueBtnText: { color: C.white, fontWeight: '900', fontSize: 15 },
  downloadRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  downloadBtn: { flex: 2, backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  downloadBtnText: { color: C.white, fontWeight: '800', fontSize: 14 },
  shareBtn: { flex: 1, backgroundColor: C.primaryLight, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: C.primaryMid },
  shareBtnText: { color: C.primary, fontWeight: '800', fontSize: 14 },

  // Legacy (kept for compat)
  resumeDoc: { backgroundColor: C.white, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.border, marginBottom: 4 },
  resumeDocHeader: { flexDirection: 'row', gap: 14, padding: 16, borderBottomWidth: 1, alignItems: 'center' },
  resumeInitials: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  resumeInitialsText: { color: C.white, fontSize: 16, fontWeight: '900' },
  resumeDocName: { fontSize: 17, fontWeight: '900', letterSpacing: -0.3 },
  resumeDocTagline: { fontSize: 12, color: C.textSub, marginTop: 1 },
  resumeDocContact: { fontSize: 10, color: C.textMuted, marginTop: 3 },
  resumeDocSection: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, borderBottomWidth: 0.5 },
  resumeDocEntry: { fontSize: 13, fontWeight: '700', color: C.text, paddingHorizontal: 16, marginTop: 8 },
  resumeDocMeta: { fontSize: 11, color: C.textSub, paddingHorizontal: 16 },
  resumeSkillTag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, marginHorizontal: 16, marginBottom: 12 },
  resumeSkillTagText: { fontSize: 11, fontWeight: '700' },


  // Update these styles in your StyleSheet
compactHeader: {
  backgroundColor: C.primary, 
  paddingTop: 10, 
  paddingBottom: 10,
  paddingHorizontal: 20, 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'space-between',
  // Remove borderWidth and borderColor
},

searchContainer: { 
  flexDirection: 'row', 
  paddingHorizontal: 16, 
  paddingVertical: 10, 
  backgroundColor: C.white, 
  gap: 10, 
  elevation: 2, 
  shadowColor: '#000', 
  shadowOpacity: 0.06, 
  shadowRadius: 6,
  
  // Remove borderWidth and borderColor
},

activePillsRow: { 
  paddingHorizontal: 16, 
  paddingVertical: 8, 
  gap: 8, 
  flexDirection: 'row',
  // Remove fixed height and border
  flexWrap: 'wrap',
  height: 44,

},

resultsRow: { 
  flexDirection: 'row', 
  paddingHorizontal: 16,
  justifyContent: "space-between", 
  paddingVertical: 12,
  // Remove border
  marginBottom: 4,
  
},

bottomBar: { 
  flexDirection: 'row', 
  backgroundColor: C.white, 
  borderTopWidth: 1, 
  borderTopColor: C.border, 
  paddingVertical: 12, 
  paddingHorizontal: 8,
  // Ensure it stays at bottom
  position: 'relative',
  bottom: 0,
},
})

export default SuccessScreen;