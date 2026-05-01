import { StyleSheet, Platform } from "react-native";
import { C } from ".";

export const styles = StyleSheet.create({
  header: {
    backgroundColor: C.primary,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBack: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3,
  },
  headerBadgeText: { fontSize: 11, color: '#fff', fontWeight: '700' },

  progressTrack: { height: 3, backgroundColor: C.border },
  progressFill:  { height: 3, backgroundColor: C.primary },

  tabStrip: {
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 8,
    flexGrow: 0,
  },
  tab: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 18, marginHorizontal: 3,minHeight:40 , paddingBottom:20
  },
  tabActive: { backgroundColor: C.primaryLight },
  tabDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  tabDotActive: { backgroundColor: C.primary, borderColor: C.primary },
  tabDotDone:   { backgroundColor: C.success,  borderColor: C.success },
  tabLabel:     { fontSize: 12, color: C.textSub, fontWeight: '600' },
  tabLabelActive:{ color: C.primary, fontWeight: '800' },

  card: {
    backgroundColor: C.white, borderRadius: 16,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: C.border,
    ...Platform.select({
      ios:     { shadowColor:'#000', shadowOpacity:0.04, shadowRadius:8, shadowOffset:{width:0,height:2} },
      android: { elevation: 2 },
    }),
  },
  cardTopRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  removeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.urgentBg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.urgentMid,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.text },

  formField:    { marginBottom: 14 },
  formLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  formLabel:    { fontSize: 10, fontWeight: '800', color: C.textSub, letterSpacing: 0.8 },
  formInput: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 12,
    fontSize: 14, color: C.text, backgroundColor: C.bg,
  },
  formInputFocused: {
    borderColor: C.primary, backgroundColor: C.white,
    ...Platform.select({
      ios:     { shadowColor: C.primary, shadowOpacity:0.1, shadowRadius:6, shadowOffset:{width:0,height:2} },
      android: { elevation: 2 },
    }),
  },
  formInputMultiline: { height: 90, paddingTop: 12, textAlignVertical: 'top' },
  hint: { fontSize: 12, color: C.textMuted, lineHeight: 18, marginBottom: 2 },
  rowFields: { flexDirection: 'row', alignItems: 'flex-start' },

  toggleRow:      { flexDirection: 'row', alignItems: 'center', gap: 14 },
  toggleTitle:    { fontSize: 14, fontWeight: '700', color: C.text },
  toggleSub:      { fontSize: 11, color: C.textSub, marginTop: 2 },
  toggleSwitch:   { width: 46, height: 26, borderRadius: 13, backgroundColor: C.border, justifyContent: 'center', paddingHorizontal: 3 },
  toggleSwitchOn: { backgroundColor: C.primary },
  toggleThumb:    { width: 20, height: 20, borderRadius: 10, backgroundColor: C.white, elevation: 2 },
  toggleThumbOn:  { alignSelf: 'flex-end' },

  // Chip — fixed height row + fixed chip height
  chipInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10,
  },
  chipTextInput: {
    flex: 1, borderWidth: 1.5, borderColor: C.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: C.text, backgroundColor: C.bg,
  },
  chipAddBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  // Fixed height container — never collapses, never grows unpredictably
  chipArea: {
    minHeight: 48, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 10, padding: 8, backgroundColor: C.bg, justifyContent: 'center',
  },
  chipEmpty: { fontSize: 12, color: C.textMuted, textAlign: 'center' },
  chipWrap:  { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.primaryLight, borderRadius: 6,
    paddingLeft: 10, paddingRight: 6,
    // Fixed height chip
    height: 30,
    borderWidth: 1, borderColor: C.primaryMid, gap: 5,
  },
  chipText:  { fontSize: 12, color: C.primary, fontWeight: '700', maxWidth: 120 },
  chipX: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: C.primary + '18',
    alignItems: 'center', justifyContent: 'center',
  },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.primaryMid,
    borderRadius: 12, paddingVertical: 13, marginBottom: 12, backgroundColor: C.primaryLight,
  },
  addBtnText: { fontSize: 14, color: C.primary, fontWeight: '700' },

  // Layout cards
  layoutCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderColor: C.border, borderRadius: 12,
    padding: 14, marginBottom: 10, backgroundColor: C.bg,
  },
  layoutCardActive: {
    borderColor: C.primary, backgroundColor: C.primaryLight,
  },
  layoutIcon: { fontSize: 22, color: C.textMuted, width: 28, textAlign: 'center' },
  layoutName: { fontSize: 14, fontWeight: '800', color: C.text },
  layoutDesc: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  layoutCheck: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
  },
  previewStrip: {
    marginTop: 8, backgroundColor: C.bg, borderRadius: 10,
    padding: 12, borderWidth: 1, borderColor: C.border, alignItems: 'center',
  },
  previewStripLabel: { fontSize: 13, color: C.textSub, fontWeight: '600' },
  previewStripSub:   { fontSize: 11, color: C.textMuted, marginTop: 2 },

  // Completeness check
  checkRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  checkDot:  { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  checkLabel:{ fontSize: 13, fontWeight: '600' },

  actionGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  actionBtn: {
    flex: 1, borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 7,
    ...Platform.select({
      ios:     { shadowColor:'#000', shadowOpacity:0.12, shadowRadius:8, shadowOffset:{width:0,height:3} },
      android: { elevation: 3 },
    }),
  },
  actionBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  // Bottom nav — fixed, NOT position:absolute so it doesn't float over keyboard
  bottomNav: {
    backgroundColor: C.white,
    borderTopWidth: 1, borderTopColor: C.border,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    ...Platform.select({
      ios:     { shadowColor:'#000', shadowOpacity:0.07, shadowRadius:10, shadowOffset:{width:0,height:-3} },
      android: { elevation: 8 },
    }),
  },
  navBack:     { paddingVertical: 10, paddingHorizontal: 14 },
  navBackText: { color: C.primary, fontWeight: '700', fontSize: 14 },
  navNext: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.primary, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 20,
    ...Platform.select({
      ios:     { shadowColor: C.primary, shadowOpacity:0.3, shadowRadius:8, shadowOffset:{width:0,height:3} },
      android: { elevation: 4 },
    }),
  },
  navNextText: { color: '#fff', fontWeight: '800', fontSize: 15 },
})