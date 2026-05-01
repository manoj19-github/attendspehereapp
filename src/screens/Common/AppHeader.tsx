import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Bell, ArrowLeft, Menu } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { StoreState } from '../../models/reduxModel';
import CachedImage from '../../components/CachedImage';
import Avatar from '../../components/avatar';

type AppHeaderProps = {
  navigation: any;
  badgeCount?: number;
  avatarUri?: string | null;
  onAvatarPress?: () => void;
  onBellPress?: () => void;
  onMenuPress?: () => void;
  showBack?: boolean; // ✅ control back vs hamburger
};

export default function AppHeader({
  navigation,
  badgeCount = 3,
  avatarUri = null,
  onAvatarPress,
  onBellPress,
  onMenuPress,
  showBack = false,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const user_details = useSelector(
    (state: StoreState) => state.auth.user_details,
  );
  const candidate_profile_details = useSelector(
    (state: StoreState) => state.auth.candidate_profile_details,
  );

  const profileImage =
    candidate_profile_details?.personalinfo?.profile_signed_url ||
    user_details?.personalinfo?.profile_signed_url;

  const fullName =
    candidate_profile_details?.candidate_details?.full_name ||
    user_details?.candidate_details?.full_name;
  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        {/* LEFT */}
        {showBack ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            style={styles.leftBtn}
          >
            <ArrowLeft size={20} color="#7A2F2F" />
          </TouchableOpacity>
        ) : (
          <View style={styles.leftGroup}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onMenuPress}
              style={styles.menuBtn}
            >
              <Menu size={22} color="#2D2D2D" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onAvatarPress}
              style={styles.avatarBtn}
            >
              {/* {user_details && user_details?.personalinfo && user_details.personalinfo?.profile_signed_url ? (
                <CachedImage imageUrl={user_details.personalinfo.profile_signed_url} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>
                    {user_details && user_details?.candidate_details?.full_name && user_details?.candidate_details?.full_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )} */}
              {profileImage ? (
                <CachedImage imageUrl={profileImage} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>
                    {fullName?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ flex: 1 }} />

        {/* RIGHT */}
        {/* <TouchableOpacity
          activeOpacity={0.85}
          onPress={onBellPress}
          style={styles.bellBtn}
        >
          <Bell size={20} color="#2D2D2D" />
          {badgeCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {badgeCount > 9 ? "9+" : badgeCount}
              </Text>
            </View>
          )}
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 6 : 0,
    paddingHorizontal: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  row: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },

  leftBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,106,30,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(122,47,47,0.20)',
  },

  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E9EEF5',
    borderWidth: 2,
    borderColor: '#D14B3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: { fontWeight: '900', color: '#2D2D2D' },

  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: 2,
    top: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D93B2A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
});
