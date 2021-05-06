const confFile = `/var/tmp/tezster/config.json`,
      CONSEIL_JS = '../../lib/conseiljs',
      VAR_PATH = '/var',
      TEMP_PATH = '/var/tmp',
      TEZSTER_FOLDER_PATH  = `/var/tmp/tezster`,
      TEZSTER_LOGS_FOLDER_PATH  = `/var/tmp/tezster/tezster-logs`,
      COMMAND_LOG_FILE = `/var/tmp/tezster/tezster-logs/tezster-command-logs.log`,
      LOGS_ZIPFILE_NAME = 'tezster-node-logs.tar.gz',
      LOGS_ZIPFILE_PATH = `/var/tmp/tezster/tezster-logs/tezster-node-logs.tar.gz`,
      LOG_FOLDER_PATH_INSIDE_DOCKER = `/home/tezos/tezster-logs`,
      CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE = require('path').join(__dirname, '/../config.json'),
      TEZSTER_FOLDER_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE = require('path').join(__dirname, '/../tezster'),
      
      IMAGE_TAG = 'tezsureinc/tezster:1.0.6-beta.3',
      CONTAINER_NAME = 'tezster',
      PROGRESS_REFRESH_INTERVAL = 1000,
      Node_Confirmation_Timeout = 55000,
      NODE_CONFIRMATION_TIMEOUT_WIN = 140000,
      Start_Nodes_Progress_Bar_Interval = 2.2,
      START_NODES_PROGRESS_BAR_INTERVAL_WIN = 0.78,
      LOCAL_NODE_URL = 'http://localhost:18732',
      WIN_OS_PLATFORM = 'win32',
      WIN_WSL_OS_RELEASE = 'microsoft',
      
      NETWORK = 'PsFLor',
      NODE_TYPE = {
          LOCALHOST: 'localhost',
          WIN_LOCALHOST: '192.168',
          TESTNET: 'edonet',
          MAINNET: 'mainnet',
          FLORENCENET: 'florencenet'
      }, 

      TZSTATS_NODE_TYPE = {
        TESTNET: 'edo',
      }, 

      CONSEIL_SERVER = {
        TESTNET: {
          url: 'https://conseil-edo.cryptonomic-infra.tech:443',
          apiKey: '15e4c75c-af4e-4a62-9aa6-1e0a5b96a2a2',
        },
        FLORENCENET: {
          url: 'https://conseil-florence.cryptonomic-infra.tech:443',
          apiKey: '6f81a18d-3643-4633-b5d8-028cf2687fed',
        },
        MAINNET: {
          url: 'https://conseil-prod.cryptonomic-infra.tech',
          apiKey: '19f49afb-c33d-4251-8565-e95121df519d',
        },
      };

module.exports = { confFile, CONSEIL_JS, TEZSTER_LOGS_FOLDER_PATH, IMAGE_TAG, CONTAINER_NAME, LOCAL_NODE_URL, COMMAND_LOG_FILE,
                   PROGRESS_REFRESH_INTERVAL, TEZSTER_FOLDER_PATH, START_NODES_PROGRESS_BAR_INTERVAL_WIN, NETWORK, TZSTATS_NODE_TYPE,
                   LOGS_ZIPFILE_PATH, LOG_FOLDER_PATH_INSIDE_DOCKER, LOGS_ZIPFILE_NAME, NODE_TYPE, CONSEIL_SERVER,
                   CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE, WIN_OS_PLATFORM, WIN_WSL_OS_RELEASE, TEMP_PATH, VAR_PATH,
                   NODE_CONFIRMATION_TIMEOUT_WIN, Node_Confirmation_Timeout, Start_Nodes_Progress_Bar_Interval, TEZSTER_FOLDER_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE };