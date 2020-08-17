const confFile = `/var/tmp/tezster/config.json`,
      CONSEIL_JS = '../../lib/conseiljs',
      TEMP_PATH = '/var/tmp',
      TEZSTER_FOLDER_PATH  = `/var/tmp/tezster`,
      TEZSTER_LOGS_FOLDER_PATH  = `/var/tmp/tezster/tezster-logs`,
      COMMAND_LOG_FILE = `/var/tmp/tezster/tezster-logs/tezster-command-logs.log`,
      LOGS_ZIPFILE_NAME = 'tezster-node-logs.tar.gz',
      LOGS_ZIPFILE_PATH = `/var/tmp/tezster/tezster-logs/tezster-node-logs.tar.gz`,
      LOG_FOLDER_PATH_INSIDE_DOCKER = `/usr/local/bin/tezster-logs`,
      CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE = require('path').join(__dirname, '/../config.json'),
      
      IMAGE_TAG = 'tezsureinc/tezster:1.0.3',
      CONTAINER_NAME = 'tezster',
      PROGRESS_REFRESH_INTERVAL = 1000,
      Node_Confirmation_Timeout = 40000,
      NODE_CONFIRMATION_TIMEOUT_WIN = 125000,
      Start_Nodes_Progress_Bar_Interval = 2.5,
      START_NODES_PROGRESS_BAR_INTERVAL_WIN = 0.80,
      LOCAL_NODE_URL = 'http://localhost:18732',
      WIN_OS_PLATFORM = 'win32',
      WIN_WSL_OS_RELEASE = 'microsoft',
      
      NODE_TYPE = {
          LOCALHOST: 'localhost',
          WIN_LOCALHOST: '192.168',
          DALPHANET: 'dalphanet',
          CARTHAGENET: 'carthagenet',
          MAINNET: 'mainnet',
      }, 

      CONSEIL_SERVER = {
        Carthagenet: {
          url: 'https://conseil-dev.cryptonomic-infra.tech',
          apiKey: '60d7bbd0-ad43-4768-9ee3-64c722874f96',
        },
        Mainnet: {
          url: 'https://conseil-prod.cryptonomic-infra.tech',
          apiKey: '19f49afb-c33d-4251-8565-e95121df519d',
        },
      };

module.exports = { confFile, CONSEIL_JS, TEZSTER_LOGS_FOLDER_PATH, IMAGE_TAG, CONTAINER_NAME, LOCAL_NODE_URL, COMMAND_LOG_FILE,
                   PROGRESS_REFRESH_INTERVAL, TEZSTER_FOLDER_PATH, START_NODES_PROGRESS_BAR_INTERVAL_WIN, 
                   LOGS_ZIPFILE_PATH, LOG_FOLDER_PATH_INSIDE_DOCKER, LOGS_ZIPFILE_NAME, NODE_TYPE, CONSEIL_SERVER,
                   CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE, WIN_OS_PLATFORM, WIN_WSL_OS_RELEASE, TEMP_PATH,
                   NODE_CONFIRMATION_TIMEOUT_WIN, Node_Confirmation_Timeout, Start_Nodes_Progress_Bar_Interval };