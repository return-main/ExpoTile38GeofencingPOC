import React from 'react';
import {Button, View} from 'react-native';
import HelpeeService from './HelpeeService';
import {Card} from 'react-native-elements';
import ErrorBoundary from 'react-native-error-boundary';

class HelpeeComponent extends React.Component {
  handleOnPress = () => HelpeeService.requestHelp();

  render() {
    return (
      <Card title={'Demander de l\'aide'}>
        <ErrorBoundary>
          <Button
            title={'Demander de l\'aide'}
            icon={{name: 'hand-holding-heart', type: 'font-awesome'}}
            onPress={this.handleOnPress}
          />
        </ErrorBoundary>
      </Card>
    );
  }
}

export default HelpeeComponent;
