import { useFocusEffect } from '@react-navigation/native'
import React, { FC, useState, useRef, useCallback, useEffect } from 'react'
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  StatusBar,
  Animated,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { GetJobListAction } from '../../stores/actions/jobAction'
import { GetAllDomainMasterAction } from '../../stores/actions/authAction'
import { StoreState } from '../../models/reduxModel'
import { Colors } from '../../utils'
import { JobInterface } from '../../models/jobModel'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ─── Theme ─────────────────────────────────────────────────────────────────────
export const C = {
  primary: '#F97316',
  primaryDark: '#C2570A',
  primaryLight: '#FFF7ED',
  primaryMid: '#FED7AA',
  bg: '#F5F4F1',
  card: '#FFFFFF',
  text: '#1C1917',
  textSub: '#78716C',
  textMuted: '#A8A29E',
  border: '#E7E5E4',
  borderLight: '#F0EEed',
  success: '#16A34A',
  successBg: '#F0FDF4',
  successMid: '#BBF7D0',
  urgent: '#DC2626',
  urgentBg: '#FFF5F5',
  urgentMid: '#FECACA',
  info: '#2563EB',
  infoBg: '#EFF6FF',
  infoMid: '#BFDBFE',
  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.5)',
}

// ─── Types ──────────────────────────────────────────────────────────────────────
interface DomainItem {
  domain_code: string
  domain_value: string
}

const ALL_ITEM: DomainItem = { domain_code: '0', domain_value: 'ALL' }

// ─── Helpers ────────────────────────────────────────────────────────────────────
const badgeConfig = (badge: string) => {
  if (badge === 'urgent') return { bg: C.urgentBg, border: C.urgentMid, text: C.urgent, label: '🔥 URGENT' }
  if (badge === 'new') return { bg: C.successBg, border: C.successMid, text: C.success, label: '✨ NEW' }
  return { bg: C.infoBg, border: C.infoMid, text: C.info, label: '📋 OPEN' }
}

// ─── Debounce Hook ──────────────────────────────────────────────────────────────
function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// ─── Logo Circle ────────────────────────────────────────────────────────────────
const LogoCircle: FC<{ initials: string; color: string; size?: number }> = ({ initials, color, size = 46 }) => (
  <View style={[s.logoCircle, { width: size, height: size, borderRadius: size * 0.28, backgroundColor: color + '18', borderColor: color + '35' }]}>
    <Text style={[s.logoText, { color, fontSize: size * 0.31 }]}>{initials}</Text>
  </View>
)

// ─── Job Card ───────────────────────────────────────────────────────────────────
const JobCard: FC<{ job: JobInterface; onPress: () => void; index: number }> = ({ job, onPress, index }) => {
  const badgeName = job.is_approved ? 'open' : 'new'
  const b = badgeConfig(badgeName)

  const initials = (job.employer_name ?? '')
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase() || '??'

  const COLORS = ['#4F46E5', '#0891B2', '#059669', '#7C3AED', '#DB2777', '#EA580C']
  const logoColor = COLORS[job.job_id % COLORS.length]

  const salaryLabel = job.salary_min && job.salary_max
    ? `₹${Number(job.salary_min).toLocaleString('en-IN')} – ₹${Number(job.salary_max).toLocaleString('en-IN')}`
    : job.salary_min
      ? `₹${Number(job.salary_min).toLocaleString('en-IN')}+`
      : 'Salary N/A'

  const anim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 350, delay: Math.min(index, 8) * 60, useNativeDriver: true }).start()
  }, [])

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
      <TouchableOpacity style={s.jobCard} onPress={onPress} activeOpacity={0.88}>
        {/* Top Row */}
        <View style={s.jobCardTop}>
          <LogoCircle initials={initials} color={logoColor} />
          <View style={s.jobCardInfo}>
            <Text style={s.jobTitle} numberOfLines={1}>{job.title}</Text>
            <Text style={s.jobCompany}>{job.employer_name}</Text>
          </View>
          
                      {job.applicant_count !== undefined ? (
                <View style={[s.badgePill, { backgroundColor: b.bg, borderColor: b.border,flexDirection:"row",gap:"5" }]}><Text style={s.tagIcon}>👥</Text><Text style={s.tagText}>{job.applicant_count}</Text></View>
          ) : null}
          </View>
        

        {/* Tags */}
        <View style={s.tagRow}>
          {job.location ? (
            <View style={s.tag}><Text style={s.tagIcon}>📍</Text><Text style={s.tagText}>{job.location}</Text></View>
          ) : null}
          {job.job_type_name ? (
            <View style={s.tag}><Text style={s.tagIcon}>💼</Text><Text style={s.tagText}>Job Type : {job.job_type_name}</Text></View>
          ) : null}
          {job.job_category_name ? (
            <View style={s.tag}><Text style={s.tagIcon}>💼</Text><Text style={s.tagText}> Job Category : {job.job_category_name}</Text></View>
          ) : null}

        </View>

        {/* Skills */}
        {/* {job.skill_names?.length > 0 && (
          <View style={s.tagRow}>
            {job.skill_names.slice(0, 3).map(skill => (
              <View key={skill} style={s.skillPill}>
                <Text style={s.skillPillText}>{skill}</Text>
              </View>
            ))}
            {job.skill_names.length > 3 && (
              <View style={s.skillPill}>
                <Text style={s.skillPillText}>+{job.skill_names.length - 3}</Text>
              </View>
            )}
          </View>
        )} */}

        {/* Bottom */}
        <View style={s.jobCardBottom}>
          <Text style={s.salaryText}>{salaryLabel}</Text>
          {job.created_on ? (
            <Text style={s.metaText}>{new Date(job.created_on).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ─── Salary Range Input ──────────────────────────────────────────────────────────
const SalaryRangeInput: FC<{
  salaryMin: string
  salaryMax: string
  onChangeMin: (v: string) => void
  onChangeMax: (v: string) => void
}> = ({ salaryMin, salaryMax, onChangeMin, onChangeMax }) => (
  <View style={s.salaryRow}>
    <View style={s.salaryInputWrap}>
      <Text style={s.salaryInputLabel}>Min (₹)</Text>
      <TextInput
        style={s.salaryInput}
        value={salaryMin}
        onChangeText={v => onChangeMin(v.replace(/[^0-9]/g, ''))}
        placeholder="e.g. 20000"
        placeholderTextColor={C.textMuted}
        keyboardType="numeric"
      />
    </View>
    <Text style={s.salarySep}>–</Text>
    <View style={s.salaryInputWrap}>
      <Text style={s.salaryInputLabel}>Max (₹)</Text>
      <TextInput
        style={s.salaryInput}
        value={salaryMax}
        onChangeText={v => onChangeMax(v.replace(/[^0-9]/g, ''))}
        placeholder="e.g. 80000"
        placeholderTextColor={C.textMuted}
        keyboardType="numeric"
      />
    </View>
  </View>
)

// ─── Bottom Filter Sheet ─────────────────────────────────────────────────────────
const FilterSheet: FC<{
  visible: boolean
  onClose: () => void
  activeType: DomainItem
  activeCategory: DomainItem
  salaryMin: string
  salaryMax: string
  onApply: (type: DomainItem, cat: DomainItem, sMin: string, sMax: string) => void
}> = ({ visible, onClose, activeType, activeCategory, salaryMin, salaryMax, onApply }) => {
  const [selType, setSelType] = useState<DomainItem>(activeType)
  const [selCat, setSelCat] = useState<DomainItem>(activeCategory)
  const [selSalaryMin, setSelSalaryMin] = useState(salaryMin)
  const [selSalaryMax, setSelSalaryMax] = useState(salaryMax)
  const slideAnim = useRef(new Animated.Value(400)).current

  const jobType: DomainItem[] = useSelector((state: StoreState) => state.auth.get_all_domain_list?.job_type) ?? []
  const jobCategory: DomainItem[] = useSelector((state: StoreState) => state.auth.get_all_domain_list?.job_category) ?? []

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 400,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }).start()
    if (visible) {
      // ✅ Sync local state when sheet opens
      setSelType(activeType)
      setSelCat(activeCategory)
      setSelSalaryMin(salaryMin)
      setSelSalaryMax(salaryMax)
    }
  }, [visible])

  if (!visible) return null

  const handleReset = () => {
    setSelType(ALL_ITEM)
    setSelCat(ALL_ITEM)
    setSelSalaryMin('')
    setSelSalaryMax('')
  }

  const jobTypeList: DomainItem[] = [ALL_ITEM, ...jobType]
  const jobCategoryList: DomainItem[] = [ALL_ITEM, ...jobCategory]

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <TouchableOpacity style={s.sheetOverlay} onPress={onClose} activeOpacity={1} />
      <Animated.View style={[s.filterSheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={s.sheetHandle} />
        <View style={s.sheetHeader}>
          <Text style={s.sheetTitle}>Filter Jobs</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={s.resetText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Job Type */}
          <Text style={s.filterGroupLabel}>JOB TYPE</Text>
          <View style={s.chipGroup}>
            {jobTypeList.map(t => {
              // ✅ FIX: Compare domain_code strings, not object references
              const isActive = selType.domain_code === t.domain_code
              return (
                <TouchableOpacity
                  key={t.domain_code}
                  style={[s.filterChipLg, isActive && s.filterChipLgActive]}
                  onPress={() => setSelType(t)}
                >
                  <Text style={[s.filterChipLgText, isActive && s.filterChipLgTextActive]}>
                    {t.domain_value}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Category */}
          <Text style={s.filterGroupLabel}>CATEGORY</Text>
          <View style={s.chipGroup}>
            {jobCategoryList.map(c => {
              // ✅ FIX: Compare domain_code strings, not object references
              const isActive = selCat.domain_code === c.domain_code
              return (
                <TouchableOpacity
                  key={c.domain_code}
                  style={[s.filterChipLg, isActive && s.filterChipLgActive]}
                  onPress={() => setSelCat(c)}
                >
                  <Text style={[s.filterChipLgText, isActive && s.filterChipLgTextActive]}>
                    {c.domain_value}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Salary Range */}
          <Text style={s.filterGroupLabel}>SALARY RANGE (₹/month)</Text>
          <SalaryRangeInput
            salaryMin={selSalaryMin}
            salaryMax={selSalaryMax}
            onChangeMin={setSelSalaryMin}
            onChangeMax={setSelSalaryMax}
          />

          {/* Quick Presets */}
          <View style={[s.chipGroup, { marginTop: 10 }]}>
            {[
              { label: 'Upto ₹20k', min: '0', max: '20000' },
              { label: '₹20k–50k', min: '20000', max: '50000' },
              { label: '₹50k–1L', min: '50000', max: '100000' },
              { label: '₹1L+', min: '100000', max: '' },
            ].map(preset => {
              const isActive = selSalaryMin === preset.min && selSalaryMax === preset.max
              return (
                <TouchableOpacity
                  key={preset.label}
                  style={[s.filterChipLg, isActive && s.filterChipLgActive]}
                  onPress={() => { setSelSalaryMin(preset.min); setSelSalaryMax(preset.max) }}
                >
                  <Text style={[s.filterChipLgText, isActive && s.filterChipLgTextActive]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

        </ScrollView>

        <TouchableOpacity
          style={s.applyFilterBtn}
          onPress={() => { onApply(selType, selCat, selSalaryMin, selSalaryMax); onClose() }}
        >
          <Text style={s.applyFilterBtnText}>Apply Filters</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

// ─── Screen: Job Listing ────────────────────────────────────────────────────────
const JobListingScreen: FC<{ onJobPress: (job: JobInterface) => void; onResume: () => void }> = ({ onJobPress, onResume }) => {
  const dispatch = useDispatch()
  const [search, setSearch] = useState('')
  // ✅ State holds full DomainItem objects so labels are always available
  const [activeType, setActiveType] = useState<DomainItem>(ALL_ITEM)
  const [activeCategory, setActiveCategory] = useState<DomainItem>(ALL_ITEM)
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [filterVisible, setFilterVisible] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const jobListingResponseWrapper = useSelector((state: StoreState) => state.job?.job_list_wrapper)
  const results: JobInterface[] = jobListingResponseWrapper?.jobs_list || []
  const totalPages = jobListingResponseWrapper?.total_pages ?? 1
  const hasMore = currentPage < totalPages

  const debouncedSearch = useDebounce(search, 400)

  useEffect(() => {
    setIsSearching(search !== debouncedSearch)
  }, [search, debouncedSearch])

  const buildPayload = (page: number, searchStr: string) => ({
    page,
    limit: 10,
    search_string: searchStr || undefined,
    // ✅ Send domain_code (the actual filter value) to the API
    job_type: activeType.domain_code !== '0' ? String(activeType.domain_code) : undefined,
    job_category: activeCategory.domain_code !== '0' ? String(activeCategory.domain_code) : undefined,
    salary_min: salaryMin ? Number(salaryMin) : undefined,
    salary_max: salaryMax ? Number(salaryMax) : undefined,
  })

  const fetchPage = useCallback((page: number, searchStr: string) => {
    dispatch(GetJobListAction({
      payload: buildPayload(page, searchStr),
      successCallback: () => {},
      errorCallback: () => {},
    }) as any)
  }, [activeType, activeCategory, salaryMin, salaryMax])

  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1)
      fetchPage(1, debouncedSearch)
      dispatch(GetAllDomainMasterAction({ domain_type: ['job_type', 'job_category'] }) as any)
    }, [])
  )

  useEffect(() => {
    setCurrentPage(1)
    fetchPage(1, debouncedSearch)
  }, [debouncedSearch, activeType, activeCategory, salaryMin, salaryMax])

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore || isSearching) return
    const nextPage = currentPage + 1
    setLoadingMore(true)
    setCurrentPage(nextPage)
    dispatch(GetJobListAction({
      payload: buildPayload(nextPage, debouncedSearch),
      successCallback: () => setLoadingMore(false),
      errorCallback: () => setLoadingMore(false),
    }) as any)
  }, [loadingMore, hasMore, isSearching, currentPage, debouncedSearch])

  // ✅ Use domain_code for active check, domain_value for display
  const hasActiveFilters =
    activeType.domain_code !== '0' ||
    activeCategory.domain_code !== '0' ||
    !!salaryMin ||
    !!salaryMax

  const handleApplyFilters = (
    type: DomainItem,
    cat: DomainItem,
    sMin: string,
    sMax: string,
  ) => {
    setActiveType(type)
    setActiveCategory(cat)
    setSalaryMin(sMin)
    setSalaryMax(sMax)
  }

  // Build pill labels using domain_value (human-readable)
  const activeFilterLabels: { key: string; label: string; onRemove: () => void }[] = []
  if (activeType.domain_code !== '0') {
    activeFilterLabels.push({
      key: 'type',
      label: activeType.domain_value,          // ✅ Shows "Full Time" not a code
      onRemove: () => setActiveType(ALL_ITEM),
    })
  }
  if (activeCategory.domain_code !== '0') {
    activeFilterLabels.push({
      key: 'cat',
      label: activeCategory.domain_value,      // ✅ Shows "Engineering" not a code
      onRemove: () => setActiveCategory(ALL_ITEM),
    })
  }
  if (salaryMin || salaryMax) {
    const salaryLabel =
      salaryMin && salaryMax
        ? `₹${Number(salaryMin).toLocaleString('en-IN')}–₹${Number(salaryMax).toLocaleString('en-IN')}`
        : salaryMin
          ? `₹${Number(salaryMin).toLocaleString('en-IN')}+`
          : `Upto ₹${Number(salaryMax).toLocaleString('en-IN')}`
    activeFilterLabels.push({
      key: 'salary',
      label: salaryLabel,
      onRemove: () => { setSalaryMin(''); setSalaryMax('') },
    })
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={s.compactHeader}>
        <View>
          <Text style={s.headerGreeting}>Good morning 👋</Text>
          <Text style={s.headerTitle}>Find Jobs</Text>
        </View>
        <TouchableOpacity style={s.resumeFab2} onPress={onResume}>
          <Text style={s.resumeFabIcon}>📄</Text>
          <Text style={s.resumeFabText}>Resume</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={s.searchContainer}>
        <View style={s.searchBar}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search jobs, skills, companies..."
            placeholderTextColor={C.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {isSearching
            ? <ActivityIndicator size="small" color={C.primary} style={{ marginRight: 8 }} />
            : search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={s.clearBtn}>✕</Text>
              </TouchableOpacity>
            )
          }
        </View>
        <TouchableOpacity
          style={[s.filterIconBtn, hasActiveFilters && s.filterIconBtnActive]}
          onPress={() => setFilterVisible(true)}
        >
          <Text style={{ fontSize: 18 }}>⚙️</Text>
          {hasActiveFilters && <View style={s.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <View style={s.activePillsContainer}>
          {activeFilterLabels.map(f => (
            <TouchableOpacity key={f.key} style={s.activePill} onPress={f.onRemove}>
              <Text style={s.activePillText}>{f.label}  ✕</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={s.clearAllPill}
            onPress={() => {
              setActiveType(ALL_ITEM)
              setActiveCategory(ALL_ITEM)
              setSalaryMin('')
              setSalaryMax('')
            }}
          >
            <Text style={s.clearAllPillText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results count */}
      <View style={s.resultsRow}>
        <Text style={s.resultsText}>
          {isSearching ? 'Searching...' : `${jobListingResponseWrapper?.total ?? results.length} jobs found`}
        </Text>
        <TouchableOpacity style={s.sortBtn}>
          <Text style={s.sortBtnText}>Sort: Latest ↓</Text>
        </TouchableOpacity>
      </View>

      {/* Job List */}
      <FlatList
        data={results}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        keyExtractor={j => j.job_id.toString()}
        renderItem={({ item, index }) => (
          <JobCard job={item} onPress={() => onJobPress(item)} index={index} />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={() => {
          if (loadingMore)
            return (
              <View style={s.loadMoreRow}>
                <ActivityIndicator size="small" color={C.primary} />
                <Text style={s.loadMoreText}>Loading more…</Text>
              </View>
            )
          if (!hasMore && results.length > 0)
            return (
              <View style={s.endRow}>
                <View style={s.endLine} />
                <Text style={s.endText}>All results loaded</Text>
                <View style={s.endLine} />
              </View>
            )
          return null
        }}
        ListEmptyComponent={() => {
          if (isSearching) return null
          return (
            <View style={s.emptyBox}>
              <Text style={s.emptyEmoji}>🔍</Text>
              <Text style={s.emptyTitle}>No Jobs Found</Text>
              <Text style={s.emptySub}>Try adjusting your search or filters</Text>
            </View>
          )
        }}
      />

      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        activeType={activeType}
        activeCategory={activeCategory}
        salaryMin={salaryMin}
        salaryMax={salaryMax}
        onApply={handleApplyFilters}
      />
    </View>
  )
}

// ─── Root ───────────────────────────────────────────────────────────────────────
const JobApplications: FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      <JobListingScreen
        onJobPress={j => { navigation.navigate('JobDetails', { job: j }) }}
        onResume={() => { navigation.navigate('ResumeBuilder') }}
      />
    </View>
  )
}

export default JobApplications

// ─── Styles ─────────────────────────────────────────────────────────────────────
export const s = StyleSheet.create({
  compactHeader: {
    backgroundColor: C.primary,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerGreeting: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.white, letterSpacing: -0.3 },
  resumeFab2: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, gap: 6 },
  resumeFabIcon: { fontSize: 15 },
  resumeFabText: { color: C.white, fontSize: 13, fontWeight: '700' },

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
  },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1.5, borderColor: C.border, gap: 8 },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  clearBtn: { color: C.textMuted, fontSize: 16, paddingRight: 4 },
  filterIconBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C.primaryMid },
  filterIconBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterDot: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.urgent },

  activePillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  activePill: {
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activePillText: { color: C.white, fontSize: 12, fontWeight: '600' },
  clearAllPill: {
    backgroundColor: C.bg,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  clearAllPillText: { color: C.textSub, fontSize: 12, fontWeight: '600' },

  resultsRow: { flexDirection: 'row', paddingHorizontal: 16, justifyContent: 'space-between', paddingVertical: 12, marginBottom: 4 },
  resultsText: { fontSize: 13, color: C.textSub, fontWeight: '500' },
  sortBtn: { backgroundColor: C.primaryLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  sortBtnText: { fontSize: 12, color: C.primary, fontWeight: '700' },

  jobCard: {
    backgroundColor: C.card, borderRadius: 18, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  jobCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  logoCircle: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  logoText: { fontWeight: '800' },
  jobCardInfo: { flex: 1 },
  jobTitle: { fontSize: 15, fontWeight: '800', color: C.text, letterSpacing: -0.2 },
  jobCompany: { fontSize: 12, color: C.textSub, marginTop: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: C.border, gap: 4 },
  tagIcon: { fontSize: 10 },
  tagText: { fontSize: 11, color: C.textSub, fontWeight: '500' },
  skillPill: { backgroundColor: C.primaryLight, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.primaryMid },
  skillPillText: { fontSize: 11, color: C.primary, fontWeight: '700' },
  jobCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  salaryText: { fontSize: 14, fontWeight: '800', color: C.text },
  metaText: { fontSize: 11, color: C.textMuted },
  badgePill: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 4 },
  badgePillText: { fontSize: 10, fontWeight: '800' },

  emptyBox: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.text, marginBottom: 6 },
  emptySub: { fontSize: 14, color: C.textSub },

  loadMoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 20 },
  loadMoreText: { fontSize: 13, color: C.textMuted, fontWeight: '600' },
  endRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 24, paddingHorizontal: 16 },
  endLine: { flex: 1, height: 1, backgroundColor: C.border },
  endText: { fontSize: 11, color: C.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  sheetOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: C.overlay },
  filterSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, maxHeight: '85%' },
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

  salaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  salaryInputWrap: { flex: 1 },
  salaryInputLabel: { fontSize: 10, fontWeight: '700', color: C.textSub, letterSpacing: 0.5, marginBottom: 4 },
  salaryInput: { borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text, backgroundColor: C.bg },
  salarySep: { fontSize: 18, color: C.textMuted, fontWeight: '700', marginTop: 16 },
})