import { ArrowLeft, MapPin, Briefcase, Calendar, Users, DollarSign, Bookmark, ChevronRight } from 'lucide-react-native'
import { FC, useRef } from 'react'
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  useWindowDimensions,
  Platform,
  ScrollView,
} from 'react-native'
import RenderHtml from 'react-native-render-html'
import { C } from '.'
import { JobInterface } from '../../models/jobModel'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const SKILL_COLORS = [
  { bg: '#EEEDFE', border: '#AFA9EC', dot: '#534AB7', text: '#3C3489' }, // purple
  { bg: '#E1F5EE', border: '#5DCAA5', dot: '#0F6E56', text: '#085041' }, // teal
  { bg: '#FAECE7', border: '#F0997B', dot: '#993C1D', text: '#712B13' }, // coral
  { bg: '#FAEEDA', border: '#EF9F27', dot: '#854F0B', text: '#633806' }, // amber
  { bg: '#FBEAF0', border: '#ED93B1', dot: '#993556', text: '#72243E' }, // pink
  { bg: '#EAF3DE', border: '#97C459', dot: '#3B6D11', text: '#27500A' }, // green
  { bg: '#E6F1FB', border: '#85B7EB', dot: '#185FA5', text: '#0C447C' }, // blue
]

// ─── HTML Renderer ─────────────────────────────────────────────────────────────
const HtmlContent: FC<{ html: string; containerPadding?: number }> = ({
  html,
  containerPadding = 32,
}) => {
  const { width } = useWindowDimensions()
  const tagsStyles: any = {
    body: { color: C.textSub, fontSize: 14, lineHeight: 22 },
    p: { marginTop: 0, marginBottom: 10, color: C.textSub, fontSize: 14, lineHeight: 22 },
    ul: { marginTop: 4, marginBottom: 8, paddingLeft: 6 },
    ol: { marginTop: 4, marginBottom: 8, paddingLeft: 6 },
    li: { marginBottom: 6, color: C.textSub, fontSize: 14, lineHeight: 22 },
    strong: { color: C.text, fontWeight: '700' },
    b: { color: C.text, fontWeight: '700' },
    h1: { fontSize: 18, fontWeight: '900', color: C.text, marginBottom: 8 },
    h2: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 6 },
    h3: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
    a: { color: C.primary, textDecorationLine: 'underline' },
    span: { color: C.textSub, fontSize: 14 },
  }
  return (
    <RenderHtml
      contentWidth={width - containerPadding}
      source={{ html }}
      tagsStyles={tagsStyles}
      enableExperimentalBRCollapsing
      enableExperimentalGhostLinesPrevention
    />
  )
}

// ─── Logo Avatar ─────────────────────────────────────────────────────────────────
const LogoAvatar: FC<{ initials: string; color: string; size?: number }> = ({
  initials,
  color,
  size = 60,
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.3,
      backgroundColor: color,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
    }}
  >
    <Text style={{ color: '#fff', fontSize: size * 0.33, fontWeight: '900', letterSpacing: 1 }}>
      {initials}
    </Text>
  </View>
)

// ─── Info Chip ───────────────────────────────────────────────────────────────────
const InfoChip: FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <View style={d.chip}>
    {icon}
    <Text style={d.chipText}>{label}</Text>
  </View>
)

// ─── Section Card ────────────────────────────────────────────────────────────────
const SectionCard: FC<{ title: string; children: React.ReactNode; accent?: boolean }> = ({
  title,
  children,
  accent = false,
}) => (
  <View style={[d.sectionCard, accent && d.sectionCardAccent]}>
    <View style={d.sectionTitleRow}>
      {accent && <View style={d.sectionAccentBar} />}
      <Text style={d.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
)

// ─── Screen ─────────────────────────────────────────────────────────────────────
const JobDetailScreen: FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const scrollY = useRef(new Animated.Value(0)).current

  const headerBg = scrollY.interpolate({ inputRange: [0, 100], outputRange: ['rgba(249,115,22,0)', 'rgba(249,115,22,1)'], extrapolate: 'clamp' })
  const heroScale = scrollY.interpolate({ inputRange: [-80, 0], outputRange: [1.08, 1], extrapolate: 'clamp' })
  const heroOpacity = scrollY.interpolate({ inputRange: [0, 160], outputRange: [1, 0], extrapolate: 'clamp' })
  const titleOpacity = scrollY.interpolate({ inputRange: [80, 140], outputRange: [0, 1], extrapolate: 'clamp' })

  const job: JobInterface = route?.params?.job

  if (!job) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
        <Text style={{ color: C.textMuted, fontSize: 15 }}>Job not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: C.primary, fontWeight: '700' }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const initials = (job.employer_name ?? '')
    .split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() || '??'

  const COLORS = ['#4F46E5', '#0891B2', '#059669', '#7C3AED', '#DB2777', '#EA580C']
  const logoColor = COLORS[job.job_id % COLORS.length]

  const salaryLabel =
    job.salary_min && job.salary_max
      ? `₹${Number(job.salary_min).toLocaleString('en-IN')} – ₹${Number(job.salary_max).toLocaleString('en-IN')}`
      : job.salary_min
        ? `₹${Number(job.salary_min).toLocaleString('en-IN')}+`
        : 'Salary N/A'

  const postedDate = job.created_on
    ? new Date(job.created_on).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── Animated Sticky Nav ── */}
      <Animated.View style={[d.stickyNav, { backgroundColor: headerBg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={d.navBackBtn} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <Animated.Text style={[d.navTitle, { opacity: titleOpacity }]} numberOfLines={1}>
          {job.title}
        </Animated.Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Hero Section ── */}
        <Animated.View style={[d.hero, { transform: [{ scale: heroScale }], opacity: heroOpacity }]}>
          {/* Decorative circles */}
          <View style={d.heroCircle1} />
          <View style={d.heroCircle2} />

          {/* Logo + Title */}
          <View style={d.heroContent}>
            <LogoAvatar initials={initials} color={logoColor} size={64} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={d.heroTitle} numberOfLines={2}>{job.title}</Text>
              <Text style={d.heroCompany}>{job.employer_name}</Text>
            </View>
          </View>

          {/* Chips row */}
          <View style={d.heroChipsRow}>
            {job.location ? (
              <InfoChip icon={<MapPin size={11} color="rgba(255,255,255,0.85)" />} label={job.location} />
            ) : null}
                       {postedDate ? (
              <InfoChip icon={<Calendar size={11} color="rgba(255,255,255,0.85)" />} label={postedDate} />
            ) : null}
            {job.job_type_name ? (
              <InfoChip icon={<Briefcase size={11} color="rgba(255,255,255,0.85)" />} label={`Job Type : ${job.job_type_name}`} />
            ) : null}
            {
              job.job_category_name ? (
                <InfoChip icon={<Briefcase size={11} color="rgba(255,255,255,0.85)" />} label={`Job Category : ${job.job_category_name}`} />
              ):(
                <></>
              )
            }
 
          </View>
        </Animated.View>

        {/* ── Floating Stats Card ── */}
        <View style={d.statsCard}>
          <View style={d.statItem}>
            <Text style={d.statEmoji}>💰</Text>
            <Text style={d.statVal} numberOfLines={1}>{salaryLabel}</Text>
            <Text style={d.statLbl}>Salary / mo</Text>
          </View>
          <View style={d.statDiv} />
          <View style={d.statItem}>
            <Text style={d.statEmoji}>👥</Text>
            <Text style={d.statVal}>{job.applicant_count ?? 0}</Text>
            <Text style={d.statLbl}>Applicants</Text>
          </View>
          <View style={d.statDiv} />
          {/* <View style={d.statItem}>
            <Text style={d.statEmoji}>{job.is_approved ? '🟢' : '🟡'}</Text>
            <Text style={[d.statVal, { color: job.is_approved ? C.success : '#F59E0B' }]}>
              {job.is_approved ? 'Active' : 'Pending'}
            </Text>
            <Text style={d.statLbl}>Status</Text>
          </View> */}
        </View>

        {/* ── Quick Apply Banner ── */}
        <TouchableOpacity
          style={d.quickApplyBanner}
          onPress={() => navigation.navigate('ApplyJob', { job })}
          activeOpacity={0.85}
        >
          <View>
            <Text style={d.quickApplyTitle}>Ready to Apply?</Text>
            <Text style={d.quickApplySub}>Takes less than 2 minutes</Text>
          </View>
          <View style={d.quickApplyBtn}>
            <Text style={d.quickApplyBtnText}>Apply Now</Text>
            <ChevronRight size={16} color={C.primary} />
          </View>
        </TouchableOpacity>


        {/* ── Category & Type Tags ── */}
        {/* <View style={d.metaRow}>
          {job.job_category_name ? (
            <View style={d.metaTag}>
              <Text style={d.metaTagIcon}>🏷️</Text>
              <Text style={d.metaTagText}> Job Category: {job.job_category_name}</Text>
            </View>
          ) : null}
          {job.job_type_name ? (
            <View style={d.metaTag}>
              <Text style={d.metaTagIcon}>🕐</Text>
              <Text style={d.metaTagText}> Job Type: {job.job_type_name}</Text>
            </View>
          ) : null}
         
        </View> */}

        {/* ── Description ── */}
        {job.description ? (
          <SectionCard title="About this Role" accent>
            {isHtml(job.description) ? (
              <HtmlContent html={job.description} containerPadding={64} />
            ) : (
              <Text style={d.bodyText}>{job.description}</Text>
            )}
          </SectionCard>
        ) : null}

                {/* ── Skills ── */}
       {job.skill_names?.length > 0 && (
  <SectionCard title="Required Skills" accent>
    {/* <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={d.skillsScrollContent}
    > */}
    <View 
    style={d.skillWrapper}
           
           
          >
      {job.skill_names.map((sk: string) => {
        // const palette = SKILL_COLORS[index % SKILL_COLORS.length]
        return (
          <View  key={sk} style={d.skillPill}>
              <Text style={[d.skillPillText]}>{sk}</Text>
            </View>
          
        )
      })}
      </View>
    {/* </ScrollView> */}
  </SectionCard>
)}


        {/* ── Responsibilities ── */}
        {job.job_responsibilities ? (
          <SectionCard title="Key Responsibilities" accent>
            {isHtml(job.job_responsibilities) ? (
              <HtmlContent html={job.job_responsibilities} containerPadding={64} />
            ) : (
              <Text style={d.bodyText}>{job.job_responsibilities}</Text>
            )}
          </SectionCard>
        ) : null}

      </Animated.ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={d.cta}>
        <TouchableOpacity style={d.saveBtn} activeOpacity={0.8}>
          <Bookmark size={20} color={C.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={d.applyBtn}
          onPress={() => navigation.navigate('ApplyJob', { job })}
          activeOpacity={0.85}
        >
          <Text style={d.applyBtnText}>Apply Now</Text>
          <ChevronRight size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── Helper ─────────────────────────────────────────────────────────────────────
function isHtml(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str)
}

// ─── Styles ─────────────────────────────────────────────────────────────────────
const d = StyleSheet.create({
  // Sticky Nav
  stickyNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
    paddingTop: Platform.OS === 'android' ? 8 : 10,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 8,
  },

  // Hero
  hero: {
    backgroundColor: C.primary,
    paddingTop: 64,
    paddingBottom: 36,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  heroCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60,
    right: -40,
  },
  heroCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -30,
    left: -30,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    lineHeight: 26,
    marginBottom: 5,
  },
  heroCompany: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  heroChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '600',
  },

  // Stats Card
  statsCard: {
    flexDirection: 'row',
    backgroundColor: C.white,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.borderLight,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 4,
  },
  statEmoji: { fontSize: 20, marginBottom: 6 },
  statVal: {
    fontSize: 13,
    fontWeight: '900',
    color: C.text,
    textAlign: 'center',
    marginBottom: 3,
  },
  statLbl: { fontSize: 10, color: C.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  statDiv: { width: 1, backgroundColor: C.borderLight, marginVertical: 16 },

  // Quick Apply Banner
  quickApplyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.primaryLight,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: C.primaryMid,
  },
  quickApplyTitle: { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 2 },
  quickApplySub: { fontSize: 11, color: C.textSub },
  quickApplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: C.primaryMid,
  },
  quickApplyBtnText: { fontSize: 13, fontWeight: '800', color: C.primary },

  // Meta tags row
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 1,
  },
  metaTagIcon: { fontSize: 13 },
  metaTagText: { fontSize: 12, color: C.text, fontWeight: '700' },

  // Section cards
  sectionCard: {
    backgroundColor: C.white,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  sectionCardAccent: {
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionAccentBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: C.primary,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: C.text,
    letterSpacing: -0.2,
  },
  bodyText: {
    fontSize: 14,
    color: C.textSub,
    lineHeight: 24,
  },

  // Skills
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillPill: {
    backgroundColor: C.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: C.primaryMid,
  },
  

  // Bottom CTA
  cta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 16 : 28,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
  },
  saveBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.primaryMid,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 4,
    shadowColor: C.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  // Skills — replace existing skillsWrap, skillPill, skillPillText
skillsScrollContent: {
  flexDirection: 'row',
  gap: 10,
  paddingRight: 4,
  paddingBottom: 2,  // tiny room so shadow/border isn't clipped
},

skillDot: {
  width: 6,
  height: 6,
  borderRadius: 3,
},
skillPillText: {
  fontSize: 12,
  fontWeight: '700',
  letterSpacing: 0.1,
},
skillWrapper:{
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
}
})

export default JobDetailScreen