import Constants from 'expo-constants';
import {askAsync, getAsync, LOCATION, NOTIFICATIONS} from 'expo-permissions';
import {Notifications, Linking} from 'expo';
import {defineTask} from 'expo-task-manager';
import {
  Accuracy,
  startLocationUpdatesAsync,
  stopLocationUpdatesAsync,
} from 'expo-location';
import {HELP_API_URL} from './env';

/// There are 4 public methods:
/// start() to start sending coordinates to the server
/// stop() to stop sending coordinates to the server
/// isRunning() to check if it's currently sending
/// canBeStarted() to check if the conditions are met to start sending
class HelperService {
  static _HELPER_TASK_NAME = 'HELPER_TASK';
  _PUSH_TOKEN = '';

  /// Singleton pattern to force _defineTask() call
  constructor() {
    if (!HelperService.instance) {
      this._defineTask();
      HelperService._addNotificationListener();
      HelperService.instance = this;
    }
    return HelperService.instance;
  }

  // Creates a geo URL from received notification data and opens it with the default map app
  // Like Google Maps or Baidu Maps
  // Handle notifications that are received or selected while the app
  // is open. If the app was closed and then opened by tapping the
  // notification (rather than just tapping the app icon to open it),
  // this function will fire on the next tick after the app starts
  // with the notification data.
  static _addNotificationListener() {
    return Notifications.addListener(notification => {
      if (notification.data.latitude && notification.data.longitude) {
        const url = 'geo:' + notification.data.latitude + ',' + notification.data.longitude;
        Linking.canOpenURL(url)
          .then((supported) => {
            if (!supported) {
              console.log('Can\'t handle url: ' + url);
            } else {
              return Linking.openURL(url);
            }
          })
          .catch((err) => console.error('An error occurred', err));
      }
    });
  }

  static async _sendHelper(token, latitude, longitude) {
    const body = {
      exponentPushToken: token,
      latitude,
      longitude,
    };
    console.log('Sending locations to /helpers', body);
    return await fetch(HELP_API_URL + '/helpers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((response) => console.log('successfully sent helpers request: ', response.ok))
      .catch((error) => {
        console.log(error);
      });
  }

  /// Defines what happens once we the user starts the helper service, it has to be called once in the global scope
  _defineTask() {
    defineTask(HelperService._HELPER_TASK_NAME, ({data: {locations}, error}) => {
      if (error) {
        // check `error.message` for more details.
        console.error(error);
        return;
      }
      if (this._PUSH_TOKEN === '') {
        console.log('push token is not set, skipping');
      }
      const {latitude, longitude} = locations[0].coords;
      HelperService._sendHelper(this._PUSH_TOKEN, latitude, longitude);
    });
  }

  async _registerForPushNotificationsAsync() {
    if (this._PUSH_TOKEN !== '') {
      return;
    }
    if (Constants.isDevice) {
      const {status: existingStatus} = await getAsync(
        NOTIFICATIONS,
      );
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const {status} = await askAsync(
          NOTIFICATIONS,
        );
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      this.PUSH_TOKEN = await Notifications.getExpoPushTokenAsync();
      console.log('PUSH_TOKEN' + this.PUSH_TOKEN);
    } else {
      console.log('Must use physical device for Push Notifications');
    }
  }

  _isRunning = false
  get isRunning() {
    return this._isRunning
  }
  async start() {
    await this._registerForPushNotificationsAsync();
    await startLocationUpdatesAsync(HelperService._HELPER_TASK_NAME, {
      accuracy: Accuracy.BestForNavigation,
    });
    this._isRunning = true
  }
  async stop() {
    await stopLocationUpdatesAsync(HelperService._HELPER_TASK_NAME);
    this._isRunning = false
  }

  // eslint-disable-next-line class-methods-use-this
  async canBeStarted() {
    // if (!hasAcceptedRGPD) {
    //   return false
    // }
    const {status} = await getAsync(NOTIFICATIONS, LOCATION);
    return status === 'granted' && Constants.isDevice;
  }
}

const instance = new HelperService();
Object.freeze(instance);

export default instance;
