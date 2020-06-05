const confFile = '/tmp/tezster/config.json',
      CONSEIL_JS = '../../lib/conseiljs',
      TESTNET_NAME = 'carthagenet',
      CONSEIL_SERVER_APIKEY = 'f979f858-1941-4c4b-b231-d40d41df5377',
      CONSEIL_SERVER_URL = 'https://conseil-dev.cryptonomic-infra.tech:443',
      IMAGE_TAG = 'kapil1221/kapilmac',
      CONTAINER_NAME = 'tezster',
      PROGRESS_REFRESH_INTERVAL = 1000,
      NODE_CONFIRMATION_TIMEOUT = 40000,
      LOGS_ZIPFILE_NAME = 'tezster-node-logs.tar.gz',
      LOGS_ZIPFILE_PATH = '/tmp/tezster/tezster-logs/tezster-node-logs.tar.gz',
      COMMAND_LOGS_COLLECTION_FOLDER_PATH = '/tmp/tezster/tezster-logs/tezster-command-logs.log',
      LOG_FOLDER_PATH_INSIDE_DOCKER = '/usr/local/bin/tezster-logs',
      CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE = `__dirname, /../config.json`,
      TEZSTER_FOLDER_PATH_INSIDE_TEMP  = '/tmp/tezster',
      LOCAL_NODE_URL = 'http://localhost:18731';
      

module.exports = { confFile, CONSEIL_JS, TESTNET_NAME, CONSEIL_SERVER_APIKEY,
                   IMAGE_TAG, CONTAINER_NAME, LOCAL_NODE_URL, CONSEIL_SERVER_URL,
                   PROGRESS_REFRESH_INTERVAL, NODE_CONFIRMATION_TIMEOUT, TEZSTER_FOLDER_PATH_INSIDE_TEMP,
                   LOGS_ZIPFILE_PATH, LOG_FOLDER_PATH_INSIDE_DOCKER, LOGS_ZIPFILE_NAME,
                   COMMAND_LOGS_COLLECTION_FOLDER_PATH, CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE };