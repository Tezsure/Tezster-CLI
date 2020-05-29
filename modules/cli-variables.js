const confFile = '/tmp/tezster/config.json',
      CONSEIL_JS = '../../lib/conseiljs',
      TESTNET_NAME = 'carthagenet',
      CONSEIL_SERVER_APIKEY = 'f979f858-1941-4c4b-b231-d40d41df5377',
      CONSEIL_SERVER_URL = 'https://conseil-dev.cryptonomic-infra.tech:443',
      IMAGE_TAG = 'tezsureinc/tezster:1.0.2',
      CONTAINER_NAME = 'tezster',
      PROGRESS_REFRESH_INTERVAL = 1000,
      NODE_CONFIRMATION_TIMEOUT = 40000,
      LOCAL_NODE_URL = 'http://localhost:18731';

module.exports = { confFile, CONSEIL_JS, TESTNET_NAME,
                   CONSEIL_SERVER_APIKEY, CONSEIL_SERVER_URL,
                   IMAGE_TAG, CONTAINER_NAME, LOCAL_NODE_URL,
                   PROGRESS_REFRESH_INTERVAL, NODE_CONFIRMATION_TIMEOUT };