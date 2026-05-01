// NotificationScreen.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
} from "react-native";
import { X } from "lucide-react-native";

type NotificationItem = {
  id: string;
  name: string;
  message: string;
  time: string; // "03:42 PM"
  date: string; // "10.09.2025"
  avatar?: string;
  section: "Today" | "Yesterday";
};

export default function NotificationView({ navigation }: any) {
  const data: NotificationItem[] = [
    {
      id: "t1",
      name: "Ritika Thapa",
      message:
        "checked out your profile and wants her AC repaired. Looks like she might contact you soon — go ahead and add this to your schedule for easy tracking later.",
      time: "03:42 PM",
      date: "10.09.2025",
      avatar: "https://i.pravatar.cc/100?img=32",
      section: "Today",
    },
    {
      id: "t2",
      name: "Ritika Thapa",
      message:
        "checked out your profile and wants her AC repaired. Looks like she might contact you soon — go ahead and add this to your schedule for easy tracking later.",
      time: "03:42 PM",
      date: "10.09.2025",
      avatar: "https://i.pravatar.cc/100?img=31",
      section: "Today",
    },
    {
      id: "y1",
      name: "Ritika Thapa",
      message:
        "checked out your profile and wants her AC repaired. Looks like she might contact you soon — go ahead and add this to your schedule for easy tracking later.",
      time: "03:42 PM",
      date: "10.09.2025",
      avatar: "https://i.pravatar.cc/100?img=30",
      section: "Yesterday",
    },
  ];

  const sections = useMemo(() => {
    const map: Record<string, NotificationItem[]> = { Today: [], Yesterday: [] };
    data.forEach((n) => map[n.section].push(n));
    // flatten into list with headers
    const out: Array<{ type: "header"; title: string } | { type: "item"; item: NotificationItem }> = [];
    (["Today", "Yesterday"] as const).forEach((key) => {
      if (map[key].length) {
        out.push({ type: "header", title: key });
        map[key].forEach((it) => out.push({ type: "item", item: it }));
      }
    });
    return out;
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Notifications!</Text>

          <TouchableOpacity
            style={styles.closeBtn}
            activeOpacity={0.85}
            onPress={() => navigation.goBack()}
          >
            <X size={18} color={THEME.textDark} />
          </TouchableOpacity>
        </View>

        <View style={styles.hr} />

        <FlatList
          data={sections}
          keyExtractor={(row, idx) =>
            row.type === "header" ? `h-${row.title}` : row.item.id + "-" + idx
          }
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            if (item.type === "header") {
              return <Text style={styles.section}>{item.title}</Text>;
            }
            return <NotificationRow item={item.item} />;
          }}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
        />
      </View>
    </SafeAreaView>
  );
}

function NotificationRow({ item }: { item: NotificationItem }) {
  return (
    <View style={styles.row}>
      <Image
        source={{ uri: item.avatar || "https://i.pravatar.cc/100?img=12" }}
        style={styles.avatar}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.msg}>
          <Text style={styles.name}>{item.name} </Text>
          {item.message}
        </Text>

        <Text style={styles.meta}>
          {item.time}  |  {item.date}
        </Text>
      </View>
    </View>
  );
}

const THEME = {
  bg: "#FFFFFF",
  brand: "#7A2F2F", // same “maroon” heading vibe
  accent: "#E87305", // section label orange
  textDark: "#2D2D2D",
  text: "#6A6A6A",
  line: "rgba(0,0,0,0.08)",
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.bg },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: THEME.brand,
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
  },

  hr: { height: 1, backgroundColor: THEME.line, marginTop: 4, marginBottom: 8 },

  section: {
    marginTop: 10,
    marginBottom: 8,
    color: THEME.accent,
    fontWeight: "700",
    fontSize: 14,
  },

  row: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    alignItems: "flex-start",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EEE",
  },
  msg: {
    color: THEME.text,
    fontSize: 12.5,
    lineHeight: 18,
  },
  name: {
    fontWeight: "700",
    color: THEME.textDark,
  },
  meta: {
    marginTop: 6,
    fontSize: 10,
    color: "rgba(0,0,0,0.45)",
  },

  sep: { height: 1, backgroundColor: THEME.line },
});
