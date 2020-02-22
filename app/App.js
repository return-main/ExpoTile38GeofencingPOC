import React from 'react';
import {Button, Text, View} from 'react-native';
import {Notifications} from 'expo';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

let YOUR_PUSH_TOKEN = '';
const SENDING_POSITION_TASK_NAME = 'HELPER';

import * as TaskManager from 'expo-task-manager';

const sendHelper = async (token, latitude, longitude) => {
  const body = {
    exponentPushToken: token,
    latitude: latitude,
    longitude: longitude,
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
};

TaskManager.defineTask(SENDING_POSITION_TASK_NAME, ({data: {locations}, error}) => {
  if (error) {
    // check `error.message` for more details.
    console.error(error);
    return;
  }
  if (YOUR_PUSH_TOKEN === '') {
    console.log('push token is not set, skipping');
  }
  const {latitude, longitude} = locations[0].coords;
  sendHelper(YOUR_PUSH_TOKEN, latitude, longitude);
});

export default class AppContainer extends React.Component {
  state = {
    notification: {},
  };

  registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const {status: existingStatus} = await Permissions.getAsync(
        Permissions.NOTIFICATIONS,
      );
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const {status} = await Permissions.askAsync(
          Permissions.NOTIFICATIONS,
        );
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      YOUR_PUSH_TOKEN = await Notifications.getExpoPushTokenAsync();
      console.log(YOUR_PUSH_TOKEN);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  };


  componentDidMount() {
    this.registerForPushNotificationsAsync().then(() => {
      this.startSendingPosition();
    });

    // Handle notifications that are received or selected while the app
    // is open. If the app was closed and then opened by tapping the
    // notification (rather than just tapping the app icon to open it),
    // this function will fire on the next tick after the app starts
    // with the notification data.
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification,
    );
  }

  _handleNotification = notification => {
    const callback = (state) => console.log('State changed:' + JSON.stringify(state));
    callback(this.state);
    this.setState({notification: notification}, callback);
  };

  // Can use this function below, OR use Expo's Push Notification Tool-> https://expo.io/dashboard/notifications
  sendPushNotification = async () => {
    const message = {
      to: YOUR_PUSH_TOKEN,
      sound: 'default',
      title: 'Original Title',
      body: 'And here is the body!',
      data: {data: 'goes here'},
    };
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    const data = JSON.stringify(response._bodyInit);
    console.log(`Status & Response ID-> ${data}`);
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'space-around',
        }}>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Text>Origin: {this.state.notification.origin}</Text>
          <Text>Data: {JSON.stringify(this.state.notification.data)}</Text>
        </View>
        <Button
          title={'Press to Send Notification'}
          onPress={() => this.sendPushNotification()}
        />
      </View>
    );
  }

  startSendingPosition() {
    Location.startLocationUpdatesAsync(SENDING_POSITION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
    });
  }
}
