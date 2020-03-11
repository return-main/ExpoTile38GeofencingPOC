import Constants from 'expo-constants';
import {askAsync, getAsync, LOCATION, NOTIFICATIONS} from 'expo-permissions';
import {Notifications} from 'expo';
import {defineTask} from 'expo-task-manager';
import {
  Accuracy,
  hasStartedLocationUpdatesAsync,
  startLocationUpdatesAsync,
  stopLocationUpdatesAsync,
} from 'expo-location';

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
      HelperService.instance = this;
    }
    return HelperService.instance;
  }

  static async _sendHelper(token, latitude, longitude) {
    const body = {
      exponentPushToken: token,
      latitude,
      longitude,
    };
    console.log('Sending locations to /helpers', body);
    return await fetch('http://192.168.0.11:3000/helpers', {
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

  isRunning = () => hasStartedLocationUpdatesAsync(HelperService._HELPER_TASK_NAME);

  async start() {
    await this._registerForPushNotificationsAsync();
    await startLocationUpdatesAsync(HelperService._HELPER_TASK_NAME, {
      accuracy: Accuracy.BestForNavigation,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async stop() {
    await stopLocationUpdatesAsync(HelperService._HELPER_TASK_NAME);
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
