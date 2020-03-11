import React from 'react';
import {StyleSheet, View} from 'react-native';
import HelperComponent from './HelperComponent.jsx';
import HelpeeComponent from './HelpeeComponent.jsx';

// Important, has to be imported at the start of the application
import './HelperService';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});

export default function App() {
  return (
    <View
      style={styles.container}>
      <HelperComponent/>
      <HelpeeComponent/>
    </View>
  );
}
