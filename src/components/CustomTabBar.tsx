// src/components/CustomTabBar.tsx
import React, { useRef, useEffect } from "react";
import {
  Animated,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  StyleSheet,
} from "react-native";
import {
  Home,
  CalendarDays,
  Map as MapIcon,
  ScanLine,
  Settings,
} from "lucide-react-native"; // ✅ All icons from lucide-react-native

const { width } = Dimensions.get('window');

const CustomTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animate indicator position
  useEffect(() => {
    const activeIndex = state.routes.findIndex(
      (r: any, i: number) => state.index === i 
    );
    const adjustedIndex = activeIndex >= 2 ? activeIndex - 1 : activeIndex;
    
    Animated.spring(translateX, {
      toValue: adjustedIndex * (width * 0.7 / 4) + (width * 0.15 / 2) - 15,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [state.index]);

  const handlePress = (routeName: string, isFocused: boolean) => {
    if (isFocused) return;

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 50, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();


    navigation.navigate(routeName);
  };

  const regularTabs = state.routes;

  return (
    <View style={styles.container}>
      {/* Floating background */}
      <View style={styles.floatingBg}>
        {/* Sliding active indicator pill */}
        {/* <Animated.View
          style={[
            styles.indicator,
            { transform: [{ translateX }] },
          ]}
        /> */}
        
        {/* Tab items */}
        <View style={styles.tabsRow}>
          {regularTabs.map((route: any, index: number) => {
            const isFocused = state.index === index 
            
            let Icon = Home;
            let label = 'Home';
            
            switch (route.name) {
              case 'Dashboard':
                Icon = Home;
                label = 'Home';
                break;
              case 'History':
                Icon = CalendarDays;
                label = 'History';
                break;
              case 'Map':
                Icon = MapIcon;
                label = 'Map';
                break;
              case 'Settings':
                Icon = Settings;
                label = 'Settings';
                break;
            }

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => handlePress(route.name, isFocused)}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                <Animated.View style={{ transform: [{ scale: isFocused ? scaleAnim : 1 }] }}>
                  <View style={[styles.iconBox, isFocused && styles.iconBoxActive]}>
                    
                    <Icon
                      size={22}
                      color={isFocused ? '#fff' : '#94A3B8'}
                      strokeWidth={isFocused ? 2.5 : 2}
                    />
                  </View>
                </Animated.View>
                <Text style={[styles.label, isFocused && styles.labelActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

   
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    paddingTop:14,
    alignItems: 'center',
    
  },
  floatingBg: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingTop:14,
    paddingHorizontal: 12,
    width: '100%',
    height: 70,
    shadowColor: '#4A7DE4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  indicator: {
    position: 'absolute',
    bottom: 8,
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4A7DE4',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  iconBoxActive: {
    backgroundColor: '#4A7DE4',
    shadowColor: '#4A7DE4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderRadius:14,
    elevation: 6,
    transform: [{ translateY: -2 }],
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  labelActive: {
    color: '#4A7DE4',
    fontWeight: '700',
  },
  centerBtnContainer: {
    position: 'absolute',
    top: -25,
    left: '50%',
    marginLeft: -32,
    zIndex: 10,
  },
  centerBtn: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: '#4A7DE4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A7DE4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 4,
    borderColor: '#F0F4FF',
  },
  centerBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#4A7DE4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pulseRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#4A7DE430',
  },
});

export default CustomTabBar;