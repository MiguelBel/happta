import ipfs from 'ipfs-js'
import Settings from '../Settings/Settings'

class Contract {
  constructor(lightWalletClient, address) {
    this.lightWalletClient = lightWalletClient;
    this.address = address;
  }

  loadTitle(callback) {
    return this._remoteInstance().title.call(function(error, title){
      callback(title);
    });
  }

  countPosts(callback) {
    this._remoteInstance().numberOfPosts.call(function(error, numberOfPosts){
      let count = parseInt(numberOfPosts);
      callback(count);
    });
  }

  loadPosts(callback) {
    this._remoteInstance().numberOfPosts.call(function(error, numberOfPosts){
      let count = parseInt(numberOfPosts);
      this._loadPosts(count, callback);
    }.bind(this));
  }

  _loadPosts(count, callback) {
    for(var reference = 0; reference < count; reference++) {
      this._loadPost(reference, callback);
    }
  }

  _loadPost(reference, callback) {
    this._remoteInstance().getPost(reference, function(error, record){
      const post = {
        identifier: record[0],
        date: new Date(record[1] * 1000)
      }

      const settings = new Settings();

      let ipfsNode = { host: settings.host(), port: settings.port(), protocol: settings.protocol() };

      ipfs.setProvider(ipfsNode);

      ipfs.cat(post.identifier, function(error, buffer) {
        const rawContent = buffer.toString();
        const content = JSON.parse(rawContent);

        post.title = content.title
        post.content = content.content

        callback(post);
      });
    });
  }


  checkIfItsAValidBlog(callback) {
    const supportedVersions = [
      '0.1'
    ]

    try {
      this._remoteInstance().VERSION.call((error, version) => {
        if(supportedVersions.indexOf(version) != -1) {
          callback(true);
        } else {
          callback(false);
        }
      });
    } catch(err) {
      console.log(err);

      callback(false);
    }
  }

  _remoteInstance() {
    const endpoint = "http://testrpc:8545";
    const abi = '[{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"posts","outputs":[{"name":"content","type":"string"},{"name":"time","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"}],"name":"getPost","outputs":[{"name":"_ipfsReference","type":"string"},{"name":"time","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"title","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_title","type":"string"}],"name":"setTitle","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"ipfsReference","type":"string"}],"name":"publishPost","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"numberOfPosts","outputs":[{"name":"_count","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"VERSION","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"inputs":[{"name":"_title","type":"string"}],"payable":false,"type":"constructor"}]'
    const contractWithAbi = this.lightWalletClient.eth.contract(JSON.parse(abi));
    return contractWithAbi.at(this.address);
  }
}

export default Contract;
