// src/utils/device.utils.ts
import DeviceInfo from 'react-native-device-info';

export interface DeviceInfoData {
  androidId: string;
  deviceModel: string;
  osVersion: string;
  fingerprint: string;
}

export const getDeviceInfo = async (): Promise<DeviceInfoData> => {
  const [androidId, deviceModel, osVersion] = await Promise.all([
    DeviceInfo.getAndroidId(),
    DeviceInfo.getModel(),
    DeviceInfo.getSystemVersion(),
  ]);

  // Generate a simple fingerprint from device properties
  const fingerprint = `${androidId}_${deviceModel}_${osVersion}`;

  return {
    androidId,
    deviceModel,
    osVersion,
    fingerprint,
  };
};