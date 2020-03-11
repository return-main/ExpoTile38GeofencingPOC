import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {Notifications} from 'expo';
import {askAsync, getAsync, LOCATION, NOTIFICATIONS} from 'expo-permissions';
import {Accuracy, getCurrentPositionAsync, startLocationUpdatesAsync} from 'expo-location';
import Constants from 'expo-constants';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  notification: {alignItems: 'center', justifyContent: 'center'},
});

export default class App extends React.Component {
  state = {
    notification: {},
  };

  registerForPushNotificationsAsync = async () => {
    if (true || Constants.isDevice) {
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
        // eslint-disable-next-line no-alert
        alert('Failed to get push token for push notification!');
        return;
      }
      YOUR_PUSH_TOKEN = await Notifications.getExpoPushTokenAsync();
      console.log('PUSH_TOKEN' + YOUR_PUSH_TOKEN);
    } else {
      // eslint-disable-next-line no-alert
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
    // eslint-disable-next-line no-invalid-this
    callback(this.state);
    // eslint-disable-next-line no-invalid-this
    this.setState({notification}, callback);
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

  requestHelp = async () => {
    const {status} = await askAsync(LOCATION);
    if (status !== 'granted') {
      // eslint-disable-next-line no-invalid-this
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }
    const location = await getCurrentPositionAsync({});
    console.log('location' + location.coords);
    const body = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    console.log('Sending locations to /helpee', body);
    return await fetch('http://192.168.0.11:3000/helpee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((response) => console.log('successfully sent helpee request: ', response.ok))
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    return (
      <View
        style={styles.container}>
        <View style={styles.notification}>
          <Text>Origin: {this.state.notification.origin}</Text>
          <Text>Data: {JSON.stringify(this.state.notification.data)}</Text>
        </View>
        <Button
          title={'Request help at 500 meters'}
          onPress={() => this.requestHelp()}
        />
        <Button
          title={'Press to Send Notification'}
          onPress={() => this.sendPushNotification()}
        />
      </View>
    );
  }

  startSendingPosition = () => {
    startLocationUpdatesAsync(SENDING_POSITION_TASK_NAME, {
      accuracy: Accuracy.BestForNavigation,
    });
  };
}
