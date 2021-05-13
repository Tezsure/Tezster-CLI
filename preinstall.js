try {
    const { TEZSTER_FOLDER_PATH, TEZSTER_LOGS_FOLDER_PATH, COMMAND_LOG_FILE, TEMP_PATH, VAR_PATH } = require('./modules/cli-constants');
    const fs = require('fs');

    if (!fs.existsSync(VAR_PATH)) {
        fs.mkdirSync(VAR_PATH, { recursive: true });
    }
    if (!fs.existsSync(TEMP_PATH)) {
        fs.mkdirSync(TEMP_PATH, { recursive: true });
    }
    if (!fs.existsSync(TEZSTER_FOLDER_PATH)) {
        fs.mkdirSync(TEZSTER_FOLDER_PATH);
    }
    if (!fs.existsSync(TEZSTER_LOGS_FOLDER_PATH)) {
        fs.mkdirSync(TEZSTER_LOGS_FOLDER_PATH);
    }
    if (!fs.existsSync(COMMAND_LOG_FILE)) {
        fs.writeFileSync(COMMAND_LOG_FILE);
    }

    fs.chmodSync(TEZSTER_FOLDER_PATH, 0777);
    fs.chmodSync(TEZSTER_LOGS_FOLDER_PATH, 0777);
    fs.chmodSync(COMMAND_LOG_FILE, 0777);

} catch (error) {
    console.error(error);
    return error;
}