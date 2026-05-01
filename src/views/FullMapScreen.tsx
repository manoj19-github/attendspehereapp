import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import {
  ChevronLeft,
  Bell,
  Clock,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  MapPin,
} from 'lucide-react-native';
import { Colors, Shadows, BorderRadius, Spacing } from '../constants/colors';
import { useLocationStore } from '../store/useLocationStore';
import { useAuthStore } from '../store/useAuthStore';
import { calculateDistance } from '../utils/distance.utils';

export const FullMapScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { currentLocation, officeLocation, status, distance } = useLocationStore();
  const [mapHtml, setMapHtml] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (officeLocation && currentLocation) {
        generateMapHtml();
      }
    }, [officeLocation, currentLocation, distance])
  );

  // Get greeting with icon
  const getGreetingData = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: Sun, color: '#F59E0B', bg: '#FEF3C7' };
    if (hour < 17) return { text: 'Good Afternoon', icon: Sun, color: '#F97316', bg: '#FFEDD5' };
    if (hour < 21) return { text: 'Good Evening', icon: Sunset, color: '#8B5CF6', bg: '#EDE9FE' };
    return { text: 'Good Night', icon: Moon, color: '#6366F1', bg: '#E0E7FF' };
  };

  const greeting = getGreetingData();
  const GreetingIcon = greeting.icon;

  const generateMapHtml = () => {
    const officeLat = officeLocation?.lat ?? 0;
    const officeLng = officeLocation?.lng ?? 0;
    const userLat = currentLocation?.latitude ?? 0;
    const userLng = currentLocation?.longitude ?? 0;

    const actualDistance = distance && distance > 0 ? distance : calculateDistance(officeLat, officeLng, userLat, userLng);
    const isVeryClose = actualDistance < 50;
    const isExactSame = officeLat === userLat && officeLng === userLng;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { height: 100%; width: 100%; overflow: hidden; }
          #map { height: 100vh; width: 100vw; }
          
          .office-marker-container {
            position: relative;
            width: 32px;
            height: 40px;
          }
          .office-marker-pin {
            background: #EF4444;
            width: 28px;
            height: 28px;
            border-radius: 50% 50% 50% 0;
            border: 3px solid white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.4);
            transform: rotate(-45deg);
            position: absolute;
            top: 0;
            left: 2px;
          }
          .office-marker-inner {
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 8px;
            left: 10px;
          }
          .office-label {
            position: absolute;
            top: 32px;
            left: 50%;
            transform: translateX(-50%);
            background: #EF4444;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .user-marker-container {
            position: relative;
            width: 24px;
            height: 24px;
          }
          .user-marker-dot {
            background: #3B82F6;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            position: absolute;
            top: 2px;
            left: 2px;
            z-index: 10;
          }
          .user-pulse-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 50px;
            height: 50px;
            margin: -25px 0 0 -25px;
            border-radius: 50%;
            border: 3px solid #3B82F6;
            animation: pulse-ring 2s infinite;
            z-index: 5;
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.6); opacity: 1; }
            100% { transform: scale(1.8); opacity: 0; }
          }
          .user-label {
            position: absolute;
            top: 28px;
            left: 50%;
            transform: translateX(-50%);
            background: #3B82F6;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .info-box {
            position: absolute; 
            bottom: 20px; 
            left: 15px; 
            right: 15px;
            background: white; 
            padding: 14px 18px; 
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15); 
            z-index: 1000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .info-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 8px;
          }
          .info-title { 
            font-weight: 700; 
            font-size: 16px; 
            margin-bottom: 6px; 
            color: #1f2937; 
          }
          .info-detail { 
            font-size: 14px; 
            color: #6b7280; 
            line-height: 1.5; 
          }
          .distance-badge {
            display: inline-flex;
            align-items: center;
            background: ${actualDistance <= 100 ? '#dcfce7' : '#fee2e2'};
            color: ${actualDistance <= 100 ? '#166534' : '#991b1b'};
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 700;
            border: 1px solid ${actualDistance <= 100 ? '#86efac' : '#fca5a5'};
          }
          .distance-icon {
            margin-right: 4px;
            font-size: 14px;
          }
          .same-location-notice {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            color: #92400e;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="info-box">
          <div class="info-title">🏢 Office Location</div>
          <div class="info-row">
            <div class="info-detail">${officeLat.toFixed(5)}, ${officeLng.toFixed(5)}</div>
            ${actualDistance > 0 ? `
              <div class="distance-badge">
                <span class="distance-icon">📍</span>
                ${actualDistance < 1000 ? Math.round(actualDistance) + 'm' : (actualDistance/1000).toFixed(1) + 'km'}
                ${actualDistance <= 100 ? '<span style="margin-left:4px">✓ Inside</span>' : '<span style="margin-left:4px">✗ Outside</span>'}
              </div>
            ` : `
              <div class="distance-badge" style="background:#dbeafe;color:#1e40af;border-color:#93c5fd;">
                <span class="distance-icon">📍</span>
                Same Location
              </div>
            `}
          </div>
          ${isExactSame ? `
            <div class="same-location-notice">
              ⚠️ You are at the exact same location as the office
            </div>
          ` : ''}
        </div>
        <script>
          const officeLat = ${officeLat};
          const officeLng = ${officeLng};
          const userLat = ${userLat};
          const userLng = ${userLng};
          const isVeryClose = ${isVeryClose};
          const actualDistance = ${actualDistance};
          const isExactSame = ${isExactSame};

          const map = L.map('map', {
            zoomControl: true,
            attributionControl: true
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
          }).addTo(map);

          const officeIcon = L.divIcon({
            className: 'office-marker-wrapper',
            html: '<div class="office-marker-container"><div class="office-marker-pin"></div><div class="office-marker-inner"></div><div class="office-label">OFFICE</div></div>',
            iconSize: [32, 50],
            iconAnchor: [16, 40]
          });

          const userIcon = L.divIcon({
            className: 'user-marker-wrapper',
            html: '<div class="user-marker-container"><div class="user-pulse-ring"></div><div class="user-marker-dot"></div><div class="user-label">YOU</div></div>',
            iconSize: [50, 60],
            iconAnchor: [25, 30]
          });

          const officeMarker = L.marker([officeLat, officeLng], { 
            icon: officeIcon,
            zIndexOffset: 1000
          }).addTo(map);

          let displayUserLat = userLat;
          let displayUserLng = userLng;
          
          if (isExactSame) {
            displayUserLat = userLat + 0.00025;
            displayUserLng = userLng + 0.00025;
          } else if (actualDistance < 20) {
            displayUserLat = userLat + 0.00015;
            displayUserLng = userLng + 0.00015;
          }

          const userMarker = L.marker([displayUserLat, displayUserLng], { 
            icon: userIcon,
            zIndexOffset: 500
          }).addTo(map);

          L.circle([officeLat, officeLng], {
            color: '#EF4444',
            fillColor: '#FEE2E2',
            fillOpacity: 0.2,
            radius: 100,
            weight: 2
          }).addTo(map);

          if (actualDistance < 100) {
            L.polyline(
              [[officeLat, officeLng], [displayUserLat, displayUserLng]],
              {
                color: '#3B82F6',
                weight: 2,
                opacity: 0.6,
                dashArray: '5, 10'
              }
            ).addTo(map);
          }

          if (isVeryClose || actualDistance < 30) {
            const centerLat = (officeLat + displayUserLat) / 2;
            const centerLng = (officeLng + displayUserLng) / 2;
            map.setView([centerLat, centerLng], 18);
          } else {
            const bounds = L.latLngBounds(
              [officeLat, officeLng],
              [displayUserLat, displayUserLng]
            );
            map.fitBounds(bounds, { 
              padding: [80, 80],
              maxZoom: 18,
              animate: true
            });
          }

          setTimeout(() => {
            officeMarker.openPopup();
          }, 600);
        </script>
      </body>
      </html>
    `;
    setMapHtml(html);
  };

  return (
    <View style={styles.container}>
      {/* 🎨 Gradient Header Background */}
      <View style={styles.headerBg}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
      </View>

      {/* ✨ Modern Dashboard-Style Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.headerRow}>
          {/* Left: Back + Avatar + Greeting */}
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color={Colors.darkBlue} />
            </TouchableOpacity>
            
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            
            <View style={styles.greetingBox}>
              <View style={styles.greetingRow}>
                <View style={[styles.greetingIconBox, { backgroundColor: greeting.bg }]}>
                  <GreetingIcon size={12} color={greeting.color} strokeWidth={2.5} />
                </View>
                <Text style={[styles.greetingText, { color: greeting.color }]}>
                  {greeting.text}
                </Text>
              </View>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.fullName ?? 'User'}
              </Text>
            </View>
          </View>

          {/* Right: Notification */}
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notificationBtn}
              activeOpacity={0.7}
            >
              <Bell size={21} color={Colors.darkBlue} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Chip + Location Status */}
        <View style={styles.dateRow}>
          <View style={styles.dateChip}>
            <Clock size={12} color={Colors.primary} />
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={[
            styles.statusChip,
            { backgroundColor: status === 'in_office_area' ? '#ECFDF5' : '#FEF2F2' }
          ]}>
            <MapPin size={12} color={status === 'in_office_area' ? '#059669' : '#DC2626'} />
            <Text style={[
              styles.statusChipText,
              { color: status === 'in_office_area' ? '#059669' : '#DC2626' }
            ]}>
              {status === 'in_office_area' ? 'In Office Area' : 'Outside Office'}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Map Content */}
      {mapHtml ? (
        <WebView
          source={{ html: mapHtml }}
          style={styles.map}
          javaScriptEnabled
          domStorageEnabled
          cacheEnabled={false}
          incognito={true}
        />
      ) : (
        <View style={styles.loading}>
          <Text>Loading map...</Text>
        </View>
      )}

      {/* Bottom Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
          <Text style={styles.legendText}>Office (100m)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Your Location</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { 
            backgroundColor: status === 'in_office_area' ? Colors.success : Colors.warning 
          }]} />
          <Text style={styles.legendText}>
            {status === 'in_office_area' ? 'Inside' : 'Outside'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // 🎨 Header Background
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: '#EEF2FF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    zIndex: 0,
  },
  headerCircle1: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#C7D2FE',
    opacity: 0.4,
  },
  headerCircle2: {
    position: 'absolute',
    top: 20,
    left: -15,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A5B4FC',
    opacity: 0.3,
  },
  // ✨ Modern Header
  header: {
    paddingTop: 13,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  greetingBox: {
    flex: 1,
    justifyContent: 'center',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  greetingIconBox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.darkBlue,
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    paddingLeft: 46, // Align with greeting (backBtn 36 + gap 10)
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
    ...Shadows.sm,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  map: {
    flex: 1,
    marginTop: Spacing.sm,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.gray600,
    fontWeight: '500',
  },
});

export default FullMapScreen;