import React from 'react';
import {Button, StyleSheet, View} from 'react-native';
import {askAsync, LOCATION} from 'expo-permissions';
import {getCurrentPositionAsync} from 'expo-location';
import {HELP_API_URL} from './env';
// Important, has to be imported at the start of the application
import './HelperService';
import HelperComponent from './HelperComponent';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});

export default class App extends React.Component {
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
    return await fetch(HELP_API_URL + '/helpee', {
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
        <HelperComponent />
        <Button
          title={'Request help at 500 meters'}
          onPress={() => this.requestHelp()}
        />
      </View>
    );
  }
}
