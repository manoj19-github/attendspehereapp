// src/components/dashboard/OfficeMapCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MapPin, Navigation, Maximize2 } from 'lucide-react-native';
import { WebView } from 'react-native-webview';


import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigatons/AppNavigator';
import { OFFICE_LAT, OFFICE_LNG, OFFICE_NAME } from '../enviroments';
import { Colors } from '../constants/colors';
import Card from './Card';



type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  userLat?: number;
  userLng?: number;
  distance: number;
}

const OfficeMapCard: React.FC<Props> = ({ userLat, userLng, distance }) => {
  const navigation = useNavigation<NavigationProp>();
  const isInside = distance <= 100;

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
          .office-marker { background: #4A7DE4; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
          .user-marker { background: #4CAF50; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); animation: pulse 2s infinite; }
          @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${OFFICE_LAT}, ${OFFICE_LNG}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          // Office marker
          const officeIcon = L.divIcon({ className: 'office-marker', iconSize: [20, 20] });
          L.marker([${OFFICE_LAT}, ${OFFICE_LNG}], { icon: officeIcon })
            .addTo(map)
            .bindPopup('<b>${OFFICE_NAME}</b><br>Office Location');
          
          // Office radius circle
          L.circle([${OFFICE_LAT}, ${OFFICE_LNG}], {
            color: '#4A7DE4',
            fillColor: '#4A7DE4',
            fillOpacity: 0.1,
            radius: 100
          }).addTo(map);
          
          ${userLat && userLng ? `
          // User marker
          const userIcon = L.divIcon({ className: 'user-marker', iconSize: [16, 16] });
          L.marker([${userLat}, ${userLng}], { icon: userIcon })
            .addTo(map)
            .bindPopup('Your Location');
          ` : ''}
        </script>
      </body>
    </html>
  `;

  const handleOpenFullMap = () => {
    navigation.navigate('FullMap', {
      officeLat: OFFICE_LAT,
      officeLng: OFFICE_LNG,
      userLat,
      userLng,
    });
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MapPin size={20} color={Colors.primary} />
          <Text style={styles.title}>{OFFICE_NAME}</Text>
        </View>
        <TouchableOpacity onPress={handleOpenFullMap} style={styles.expandButton}>
          <Maximize2 size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          source={{ html: mapHtml }}
          style={styles.map}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
        
        <View style={[styles.distanceBadge, { backgroundColor: isInside ? Colors.successLighter : Colors.errorLight }]}>
          <Navigation size={14} color={isInside ? Colors.success : Colors.error} />
          <Text style={[styles.distanceText, { color: isInside ? Colors.success : Colors.error }]}>
            {isInside ? 'Inside Office' : `${Math.round(distance)}m away`}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.address}>123 Business Park, Tech City</Text>
        <Text style={styles.hours}>Working Hours: 9:00 AM - 6:00 PM</Text>
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
    height: 200,
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