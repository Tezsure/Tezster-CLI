const confFile = `/var/tmp/tezster/config.json`,
      CONSEIL_JS = '../../lib/conseiljs',
      TEMP_PATH = '/var/tmp'
      TEZSTER_FOLDER_PATH  = `/var/tmp/tezster`,
      TEZSTER_LOGS_FOLDER_PATH  = `/var/tmp/tezster/tezster-logs`,
      COMMAND_LOG_FILE = `/var/tmp/tezster/tezster-logs/tezster-command-logs.log`,
      LOGS_ZIPFILE_NAME = 'tezster-node-logs.tar.gz',
      LOGS_ZIPFILE_PATH = `/var/tmp/tezster/tezster-logs/tezster-node-logs.tar.gz`,
      LOG_FOLDER_PATH_INSIDE_DOCKER = `/usr/local/bin/tezster-logs`,
      CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE = `__dirname, /../config.json`,
      
      TESTNET_NAME = 'carthagenet',
      CONSEIL_SERVER_APIKEY = 'f979f858-1941-4c4b-b231-d40d41df5377',
      CONSEIL_SERVER_URL = 'https://conseil-dev.cryptonomic-infra.tech:443',
      IMAGE_TAG = 'tezsureinc/tezster:1.0.3-beta',
      CONTAINER_NAME = 'tezster',
      PROGRESS_REFRESH_INTERVAL = 1000,
      Node_Confirmation_Timeout = 40000,
      NODE_CONFIRMATION_TIMEOUT_WIN = 125000,
      Start_Nodes_Progress_Bar_Interval = 2.5,
      START_NODES_PROGRESS_BAR_INTERVAL_WIN = 0.80,
      LOCAL_NODE_URL = 'http://localhost:18731',
      WIN_OS_PLATFORM = 'win32';
      

module.exports = { confFile, CONSEIL_JS, TESTNET_NAME, CONSEIL_SERVER_APIKEY, TEZSTER_LOGS_FOLDER_PATH,
                   IMAGE_TAG, CONTAINER_NAME, LOCAL_NODE_URL, CONSEIL_SERVER_URL, COMMAND_LOG_FILE, TEMP_PATH,
                   PROGRESS_REFRESH_INTERVAL, TEZSTER_FOLDER_PATH, START_NODES_PROGRESS_BAR_INTERVAL_WIN,
                   LOGS_ZIPFILE_PATH, LOG_FOLDER_PATH_INSIDE_DOCKER, LOGS_ZIPFILE_NAME,
                   CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE, WIN_OS_PLATFORM,
                   NODE_CONFIRMATION_TIMEOUT_WIN, Node_Confirmation_Timeout, Start_Nodes_Progress_Bar_Interval };