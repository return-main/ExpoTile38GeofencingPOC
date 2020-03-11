import React from 'react';
import {Button, View} from 'react-native';
import HelpeeService from './HelpeeService'

class HelpeeComponent extends React.Component {
  handleOnPress = () => HelpeeService.requestHelp();

  render() {
    return (
      <View>
        <Button
          title={'Request Help'}
          onPress={this.handleOnPress}
        />
      </View>
    );
  }
}

export default HelpeeComponent;
