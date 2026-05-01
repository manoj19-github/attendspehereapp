import { LogOut } from 'lucide-react-native';
import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';
interface LogoutConfirmProps {
  onLogoutPress?: any;
}
const LogoutConfirm = ({onLogoutPress}: LogoutConfirmProps) => {
  return (
    <View style={styles.container}>
      <Animated.Text entering={FadeInDown.delay(100)} style={styles.title}>
        Logout
      </Animated.Text>

      <Animated.Text entering={FadeInDown.delay(300)} style={styles.subtitle}>
        Are you sure you want to logout from the application?
      </Animated.Text>

      <Animated.View entering={FadeInUp.delay(500)}>
        <Pressable style={styles.button} onPress={onLogoutPress}>          
          <LogOut size={20} color={'#fff'} style={{marginRight: 8}} />
          <Text style={styles.buttonText}>Yes, Logout</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    marginLeft: 8
  },
  title: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#334155',
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default LogoutConfirm;
