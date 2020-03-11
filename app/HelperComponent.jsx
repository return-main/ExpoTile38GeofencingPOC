import React from 'react';
import helperService from './HelperService';
import {Button, View} from 'react-native';

// eslint-disable-next-line react/prefer-stateless-function
class HelperComponent extends React.Component {
  handleOnPress = () => helperService.isRunning ? helperService.stop() : helperService.start();

  render() {
    return (
      <View>
        <Button
          title={helperService.isRunning ? 'Stop' : 'Start'}
          onPress={this.handleOnPress}
        />
      </View>
    );
  }
}

export default HelperComponent;
