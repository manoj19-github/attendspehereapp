// src/components/dashboard/OfficeMapCard.tsx
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Navigation, Maximize2 } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigatons/AppNavigator';

import { Colors } from '../constants/colors';
import Card from './Card';
import { useAuthStore } from '../store/useAuthStore';
import { formatTo12Hour } from '../utils/time.utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  userLat?: number;
  userLng?: number;
  distance: number;
}

const OfficeMapCard: React.FC<Props> = ({ userLat, userLng, distance }) => {
  const navigation = useNavigation<NavigationProp>();
  const {officeSettings} = useAuthStore();
  const isInside = distance <= officeSettings?.DISTANCE_THRESHOLD;
  const changeTime12hour = useCallback((hour:number)=>{
    return formatTo12Hour(hour);
  },[]);

  // Check if user location is available
  const hasUserLocation = userLat != null && userLng != null;
  
  // Check if exact same coordinates
  const isExactSame = hasUserLocation && userLat === officeSettings?.OFFICE_LAT && userLng === officeSettings?.OFFICE_LNG;
  
  // Calculate display position for user marker (nudge if same location)
  const displayUserLat = isExactSame ? (userLat ?? 0) + 0.00025 : userLat;
  const displayUserLng = isExactSame ? (userLng ?? 0) + 0.00025 : userLng;

  const mapHtml = `
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
          
          /* Office marker - pin style with label */
          .office-marker-container {
            position: relative;
            width: 28px;
            height: 36px;
          }
          
          .office-marker-pin {
            background: #EF4444;
            width: 24px;
            height: 24px;
            border-radius: 50% 50% 50% 0;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            transform: rotate(-45deg);
            position: absolute;
            top: 0;
            left: 2px;
          }
          
          .office-marker-inner {
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 7px;
            left: 9px;
          }
          
          .office-label {
            position: absolute;
            top: 26px;
            left: 50%;
            transform: translateX(-50%);
            background: #EF4444;
            color: white;
            padding: 1px 6px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          }
          
          /* User marker - pulsing blue dot */
          .user-marker-container {
            position: relative;
            width: 20px;
            height: 20px;
          }
          
          .user-marker-dot {
            background: #3B82F6;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            position: absolute;
            top: 2px;
            left: 2px;
            z-index: 10;
          }
          
          .user-pulse-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 40px;
            height: 40px;
            margin: -20px 0 0 -20px;
            border-radius: 50%;
            border: 2px solid #3B82F6;
            animation: pulse-ring 2s infinite;
            z-index: 5;
          }
          
          @keyframes pulse-ring {
            0% { transform: scale(0.6); opacity: 1; }
            100% { transform: scale(1.8); opacity: 0; }
          }
          
          .user-label {
            position: absolute;
            top: 22px;
            left: 50%;
            transform: translateX(-50%);
            background: #3B82F6;
            color: white;
            padding: 1px 6px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const officeLat = ${officeSettings?.OFFICE_LAT??0};
          const officeLng = ${officeSettings?.OFFICE_LNG??0};
          
          const hasUserLocation = ${hasUserLocation};
          const userLat = ${displayUserLat ?? 0};
          const userLng = ${displayUserLng ?? 0};
          const isExactSame = ${isExactSame};
          const distance = ${distance};

          const map = L.map('map', {
            zoomControl: false,
            attributionControl: false
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 16
          }).addTo(map);

          // Office marker - pin with label
          const officeIcon = L.divIcon({
            className: 'office-marker-wrapper',
            html: '<div class="office-marker-container"><div class="office-marker-pin"></div><div class="office-marker-inner"></div><div class="office-label">OFFICE</div></div>',
            iconSize: [28, 40],
            iconAnchor: [14, 32]
          });

          const officeMarker = L.marker([officeLat, officeLng], { 
            icon: officeIcon,
            zIndexOffset: 1000
          }).addTo(map);

          // Office radius circle
          L.circle([officeLat, officeLng], {
            color: '#EF4444',
            fillColor: '#FEE2E2',
            fillOpacity: 0.2,
            radius: 100,
            weight: 2
          }).addTo(map);

          ${hasUserLocation ? `
          // User marker - pulsing dot with label
          const userIcon = L.divIcon({
            className: 'user-marker-wrapper',
            html: '<div class="user-marker-container"><div class="user-pulse-ring"></div><div class="user-marker-dot"></div><div class="user-label">YOU</div></div>',
            iconSize: [40, 50],
            iconAnchor: [20, 25]
          });

          const userMarker = L.marker([userLat, userLng], { 
            icon: userIcon,
            zIndexOffset: 500
          }).addTo(map);

          // Dashed line connecting office and user when close
          if (distance < 100) {
            L.polyline(
              [[officeLat, officeLng], [userLat, userLng]],
              {
                color: '#3B82F6',
                weight: 2,
                opacity: 0.5,
                dashArray: '4, 8'
              }
            ).addTo(map);
          }

          // Smart view logic
          if (isExactSame || distance < 30) {
            const centerLat = (officeLat + userLat) / 2;
            const centerLng = (officeLng + userLng) / 2;
            map.setView([centerLat, centerLng], 18);
          } else {
            const bounds = L.latLngBounds(
              [officeLat, officeLng],
              [userLat, userLng]
            );
            map.fitBounds(bounds, { 
              padding: [40, 40],
              maxZoom: 18,
              animate: true
            });
          }
          ` : `
          // No user location - just center on office
          map.setView([officeLat, officeLng], 16);
          `}
        </script>
      </body>
    </html>
  `;




  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MapPin size={20} color={Colors.primary} />
          <Text style={styles.title}>{officeSettings?.OFFICE_NAME??"Unknow Office"}</Text>
        </View>

      </View>

      <View style={styles.mapContainer}>
        <WebView
          source={{ html: mapHtml }}
          style={styles.map}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          cacheEnabled={false}
          incognito={true}
        />
        
        <View style={[styles.distanceBadge, { 
          backgroundColor: isInside ? Colors.successLighter : Colors.errorLight 
        }]}>
          <Navigation size={14} color={isInside ? Colors.success : Colors.error} />
          <Text style={[styles.distanceText, { 
            color: isInside ? Colors.success : Colors.error 
          }]}>
            {isExactSame ? '📍 Same Location' : isInside ? 'Inside Office' : `${Math.round(distance)}m away`}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.address}>{officeSettings?.OFFICE_ADDRESS}</Text>
        <Text style={styles.hours}>Working Hours: {changeTime12hour(officeSettings?.WORKING_HOURS?.start)} - {changeTime12hour(officeSettings?.WORKING_HOURS?.end)}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  expandButton: {
    padding: 8,
    backgroundColor: Colors.primaryLighter,
    borderRadius: 8,
  },
  mapContainer: {
    height: 250,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  distanceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  address: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  hours: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});

export default OfficeMapCard;