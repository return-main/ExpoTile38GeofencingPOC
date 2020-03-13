import React from 'react';
import {Button, View} from 'react-native';
import HelpeeService from './HelpeeService'
import {Card} from 'react-native-elements';

class HelpeeComponent extends React.Component {
  handleOnPress = () => HelpeeService.requestHelp();

  render() {
    return (
      <Card title={'Demander de l\'aide'}>
        <Button
          title={'Demander de l\'aide'}
          onPress={this.handleOnPress}
        />
      </Card>
    );
  }
}

export default HelpeeComponent;
