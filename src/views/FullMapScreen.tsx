import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { Colors, Spacing } from '../constants/colors';
import { useLocationStore } from '../store/useLocationStore';
import { calculateDistance } from '../utils/distance.utils';

export const FullMapScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentLocation, officeLocation, status, distance } = useLocationStore();
  const [mapHtml, setMapHtml] = useState('');

  useFocusEffect(
    useCallback(() => {
      console.log("officeLocation >> ",officeLocation);
      console.log("currentLocation >> ",currentLocation);
      if (officeLocation && currentLocation) {
        generateMapHtml();
      }
    }, [officeLocation, currentLocation, distance])
  );

  const generateMapHtml = () => {
    const officeLat = officeLocation?.lat ?? 0;
    const officeLng = officeLocation?.lng ?? 0;
    const userLat = currentLocation?.latitude ?? 0;
    const userLng = currentLocation?.longitude ?? 0;

    const actualDistance = distance && distance > 0 ? distance : calculateDistance(officeLat, officeLng, userLat, userLng);
    const isVeryClose = actualDistance < 50;

    // Check if exactly same coordinates
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
          
          /* Office marker - larger with label */
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
          
          /* User marker - pulsing blue dot */
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
          
          /* Info box */
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

          // Office marker HTML - pin style with label
          const officeIcon = L.divIcon({
            className: 'office-marker-wrapper',
            html: '<div class="office-marker-container"><div class="office-marker-pin"></div><div class="office-marker-inner"></div><div class="office-label">OFFICE</div></div>',
            iconSize: [32, 50],
            iconAnchor: [16, 40]
          });

          // User marker HTML - pulsing dot with label
          const userIcon = L.divIcon({
            className: 'user-marker-wrapper',
            html: '<div class="user-marker-container"><div class="user-pulse-ring"></div><div class="user-marker-dot"></div><div class="user-label">YOU</div></div>',
            iconSize: [50, 60],
            iconAnchor: [25, 30]
          });

          // ALWAYS place office marker at EXACT office location
          const officeMarker = L.marker([officeLat, officeLng], { 
            icon: officeIcon,
            zIndexOffset: 1000  // Office on top
          }).addTo(map);

          // User marker positioning
          let displayUserLat = userLat;
          let displayUserLng = userLng;
          
          // ALWAYS nudge user marker when at same location so both are visible
          if (isExactSame) {
            // Nudge southeast by ~30 meters so office pin and user dot don't overlap
            displayUserLat = userLat + 0.00025;
            displayUserLng = userLng + 0.00025;
          } else if (actualDistance < 20) {
            // Even when very close but not exact, slightly separate them
            displayUserLat = userLat + 0.00015;
            displayUserLng = userLng + 0.00015;
          }

          const userMarker = L.marker([displayUserLat, displayUserLng], { 
            icon: userIcon,
            zIndexOffset: 500
          }).addTo(map);

          // Geofence circle at exact office location
          L.circle([officeLat, officeLng], {
            color: '#EF4444',
            fillColor: '#FEE2E2',
            fillOpacity: 0.2,
            radius: 100,
            weight: 2
          }).addTo(map);

          // Connect office and user with a dashed line when very close
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

          // Map view logic
          if (isVeryClose || actualDistance < 30) {
            // Center on midpoint between office and displayed user position
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

          // Auto-open popups
          setTimeout(() => {
            officeMarker.openPopup();
          }, 600);
        </script>
      </body>
      </html>
    `;
    setMapHtml(html);
  };


  console.log("mapHtml>> ",mapHtml);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
     
        <Text style={styles.title}>🗺️ Full Map View</Text>
        <View style={styles.placeholder} />
      </View>

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

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
          <Text style={styles.legendText}>Office (100m radius)</Text>
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
            Status: {status === 'in_office_area' ? 'Inside' : 'Outside'}
          </Text>
        </View>
      </View>
      <View style={{height:50}}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  backBtn: { padding: Spacing.sm },
  backText: { fontSize: 16, color: Colors.primary, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.black },
  placeholder: { width: 60 },
  map: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  legend: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: Spacing.md, backgroundColor: Colors.gray50,
    borderTopWidth: 1, borderTopColor: Colors.gray200,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  legendText: { fontSize: 12, color: Colors.gray600, fontWeight: '500' },
});