import React, { Component } from 'react';
import LightWallet from '../LightWallet'

class NetworkBadge extends Component {
  constructor(props) {
    super(props);

    this.state = {
      networkName: '...'
    }

    this.lightWallet = new LightWallet();
  }

  componentDidMount() {
    this.loadNetwork();
    this.checkNetworkChanges();
  }

  render() {
    return (
      <div>
        {this.state.networkName}
      </div>
    );
  }

  loadNetwork() {
    this.lightWallet.networkId(function(id){
      this.setNetwork(id)
    }.bind(this));
  }

  setNetwork(id) {
    let network = this.networks().find(function(network) {
      return network.id == id
    });

    if(network == undefined) {
      this.setState({
        networkName: this.unknownNetwork().name
      });
    } else {
      this.setState({
        networkName: network.name
      });
    }
  }

  unknownNetwork() {
    return {
      name: 'Privatenet',
      id: 0
    };
  }

  networks() {
    return ([
      {
        name: 'Mainnet',
        id: 1
      },
      {
        name: 'Ropsten',
        id: 3
      },
      {
        name: 'Rinkerby',
        id: 4
      },
      {
        name: 'Kovan',
        id: 43
      }
    ])
  }

  checkNetworkChanges() {
    setInterval(function() {
      this.loadNetwork()
    }.bind(this), 300);
  }
}

export default NetworkBadge;
