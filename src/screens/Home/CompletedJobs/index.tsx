import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Check, Menu, Bell, User, MapPin, Briefcase } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Job = {
  id: string;
  dateGroup: "Today" | string; // e.g. "Oct 24, 2025"
  company: string;
  city: string;
  service: string;
};

const theme = {
  colors: {
    bg: "#FFFFFF",
    text: "#3C2A2A",
    subText: "#8B6B6B",
    line: "rgba(60,42,42,0.12)",
    cardBorder: "rgba(60,42,42,0.55)",
    accent: "#E87305",
    accentDark: "#B13A10",
    green: "#1C8B1E",
    pillGreen: "#1C8B1E",
    white: "#FFFFFF",
    mutedIconBg: "#EFE7E5",
  },
  font: {
    h1: { fontSize: 30, fontWeight: "800" as const },
    h2: { fontSize: 14, fontWeight: "700" as const },
    body: { fontSize: 13, fontWeight: "600" as const },
    small: { fontSize: 12, fontWeight: "600" as const },
  },
  radius: {
    card: 18,
    circle: 28,
    pill: 14,
  },
};

export default function CompletedJobs({
  navigation,
}: {
  navigation: any;
}) {
  const jobs: Job[] = useMemo(
    () => [
      {
        id: "1",
        dateGroup: "Today",
        company: "Webel Technology Limited",
        city: "Kolkata",
        service: "AC Repair & Maintenance Service",
      },
      {
        id: "2",
        dateGroup: "Oct 24, 2025",
        company: "Webel Technology Limited",
        city: "Kolkata",
        service: "AC Repair & Maintenance Service",
      },
      {
        id: "3",
        dateGroup: "Oct 24, 2025",
        company: "Webel Technology Limited",
        city: "Kolkata",
        service: "AC Repair & Maintenance Service",
      },
    ],
    []
  );

  // group by dateGroup
  const grouped = useMemo(() => {
    const map = new Map<string, Job[]>();
    jobs.forEach((j) => {
      if (!map.has(j.dateGroup)) map.set(j.dateGroup, []);
      map.get(j.dateGroup)!.push(j);
    });

    // keep insertion order (Today first, then dates)
    return Array.from(map.entries()).map(([title, items]) => ({
      title,
      items,
    }));
  }, [jobs]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Completed Jobs</Text>
      </View>

      <FlatList
        data={grouped}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 14 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
            </View>

            <View style={styles.sectionLine} />

            {item.items.map((job) => (
              <View key={job.id} style={styles.card}>
                <View style={styles.cardInnerRow}>
                  {/* Left circle icon */}
                  <View style={styles.leftCircle}>
                    <Briefcase size={22} color={theme.colors.text} />
                  </View>

                  {/* Text area */}
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                      <User size={14} color={theme.colors.text} />
                      <Text style={styles.companyText}>{job.company}</Text>
                    </View>

                    <View style={[styles.row, { marginTop: 6 }]}>
                      <MapPin size={14} color={theme.colors.green} />
                      <Text style={styles.cityText}>{job.city}</Text>
                    </View>

                    <View style={[styles.row, { marginTop: 6 }]}>
                      <Briefcase size={14} color={theme.colors.accent} />
                      <Text style={styles.serviceText}>{job.service}</Text>
                    </View>

                    {/* completed pill */}
                    <View style={styles.pill}>
                      <Check size={14} color={theme.colors.white} />
                      <Text style={styles.pillText}>Completed</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },

  // Top bar
  topBar: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBtn: {
    marginLeft: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    right: 8,
    top: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: "900",
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 6,
  },
  title: {
    color: "#7A2F2F",
    ...theme.font.h1,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  sectionHeader: {
    paddingTop: 6,
    paddingBottom: 6,
  },
  sectionTitle: {
    color: theme.colors.text,
    ...theme.font.h2,
  },
  sectionLine: {
    height: 1,
    backgroundColor: theme.colors.line,
    marginBottom: 12,
  },

  card: {
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.card,
    padding: 12,
    backgroundColor: theme.colors.bg,
    marginBottom: 12,
  },
  cardInnerRow: {
    flexDirection: "row",
    gap: 12,
  },

  leftCircle: {
    width: theme.radius.circle * 2,
    height: theme.radius.circle * 2,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.mutedIconBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(60,42,42,0.25)",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  companyText: {
    color: theme.colors.text,
    ...theme.font.body,
  },
  cityText: {
    color: theme.colors.green,
    ...theme.font.small,
  },
  serviceText: {
    color: theme.colors.accent,
    ...theme.font.small,
  },

  pill: {
    marginTop: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.pillGreen,
    paddingHorizontal: 14,
    height: 28,
    borderRadius: theme.radius.pill,
  },
  pillText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "800",
  },
});
