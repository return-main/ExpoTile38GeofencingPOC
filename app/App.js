import React from 'react';
import {StyleSheet, View} from 'react-native';
import HelperComponent from './HelperComponent.jsx';
import HelpeeComponent from './HelpeeComponent.jsx';

// Important, has to be imported at the start of the application
import './HelperService';
import {Button, Card} from 'react-native-elements';

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});

export default function App() {
  return (
    <View style={styles.container}>
      <Card title={'Systeme D\'aide (BETA)'}>
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          <HelperComponent/>
          <HelpeeComponent/>
        </View>
      </Card>
      <Card title={'Appeler les Urgences !'}>
        <Button
          icon={{name: 'ambulance', type: 'font-awesome'}}
          title='Appeler le 18'/>
      </Card>
    </View>
  );
}
