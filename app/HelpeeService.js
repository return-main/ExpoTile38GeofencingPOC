import {askAsync, LOCATION} from 'expo-permissions';
import {getCurrentPositionAsync} from 'expo-location';
import {HELP_API_URL} from './env';

class HelpeeService {
  static requestHelp = async () => {
    const {status} = await askAsync(LOCATION);
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }
    const location = await getCurrentPositionAsync({enableHighAccuracy: true});
    const body = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    console.log('Sending location to /helpee', body);
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
}

export default HelpeeService
