import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';


// Using react-native-webview for OpenStreetMap
import { WebView } from 'react-native-webview';
import { Colors, Spacing } from '../constants/colors';
import { useLocationStore } from '../store/useLocationStore';

export const FullMapScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentLocation, officeLocation, status } = useLocationStore();
  const [mapHtml, setMapHtml] = useState('');

  useEffect(() => {
    if (officeLocation && currentLocation) {
      generateMapHtml();
    }
  }, [officeLocation, currentLocation]);

  const generateMapHtml = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
          .office-marker { background: #EF4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
          .user-marker { background: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); animation: pulse 2s infinite; }
          @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
          .info-box { position: absolute; bottom: 20px; left: 20px; right: 20px; background: white; padding: 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; font-family: system-ui; }
          .info-title { font-weight: 700; font-size: 16px; margin-bottom: 4px; }
          .info-detail { font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="info-box">
          <div class="info-title">🏢 Office Location</div>
          <div class="info-detail">${officeLocation?.lat.toFixed(6)}, ${officeLocation?.lng.toFixed(6)}</div>
        </div>
        <script>
          const map = L.map('map').setView([${officeLocation?.lat}, ${officeLocation?.lng}], 16);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          // Office marker with custom icon
          const officeIcon = L.divIcon({
            className: 'office-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          
          // User marker with custom icon
          const userIcon = L.divIcon({
            className: 'user-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          
          // Add office marker
          L.marker([${officeLocation?.lat}, ${officeLocation?.lng}], { icon: officeIcon })
            .addTo(map)
            .bindPopup('<b>🏢 AttendSphere HQ</b><br>Office Location');
          
          // Add user marker
          L.marker([${currentLocation?.latitude}, ${currentLocation?.longitude}], { icon: userIcon })
            .addTo(map)
            .bindPopup('<b>📍 Your Location</b>');
          
          // Add circle for geofence
          L.circle([${officeLocation?.lat}, ${officeLocation?.lng}], {
            color: '#EF4444',
            fillColor: '#FEE2E2',
            fillOpacity: 0.2,
            radius: 100
          }).addTo(map);
          
          // Fit bounds to show both markers
          const bounds = L.latLngBounds(
            [${officeLocation?.lat}, ${officeLocation?.lng}],
            [${currentLocation?.latitude}, ${currentLocation?.longitude}]
          );
          map.fitBounds(bounds, { padding: [50, 50] });
        </script>
      </body>
      </html>
    `;
    setMapHtml(html);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🗺️ Full Map View</Text>
        <View style={styles.placeholder} />
      </View>

      {mapHtml ? (
        <WebView
          source={{ html: mapHtml }}
          style={styles.map}
          javaScriptEnabled
          domStorageEnabled
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
          <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.legendText}>
            Status: {status === 'in_office_area' ? 'Inside' : 'Outside'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  backBtn: {
    padding: Spacing.sm,
  },
  backText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
  },
  placeholder: {
    width: 60,
  },
  map: {
    flex: 1,
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
    backgroundColor: Colors.gray50,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
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