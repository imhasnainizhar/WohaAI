export interface ClientData {
  userDeviceName: string;
  userDeviceType: string;
  userDeviceID: string;
  userDeviceBrowser: string;
  userDeviceOS: string;
  userIPAddress: string;
}

export interface UserSession {
  userID: string;
  userSessionID: string;
  userDeviceName: string;
  userDeviceType: string;
  userDeviceBrowser: string;
  userDeviceOS: string;
  userIPAddress: string;
}