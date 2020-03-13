import React from 'react';
import helperService from './HelperService';
import {Button, View} from 'react-native';
import {Card} from 'react-native-elements';

// eslint-disable-next-line react/prefer-stateless-function
class HelperComponent extends React.Component {
  // eslint-disable-next-line no-invalid-this
  handleOnPress = () => this.state.isRunning ? helperService.stop() : helperService.start();

  // state object
  state = { isRunning: false };
  componentDidMount() {
    this._isRunningSubscription = helperService.isRunning.subscribe(next => this.setState({isRunning: next}))
  }
  componentWillUnmount() {
    this._isRunningSubscription.unsubscribe()
  }

  render() {
    return (
      <Card title="Aider les Autres">
        <Button
          title={this.state.isRunning ? 'Arrêter' : 'Démarrer'}
          onPress={this.handleOnPress}
        />
      </Card>
    );
  }
}

export default HelperComponent;
