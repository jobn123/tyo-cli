'use strict';

const Package = require('@tyo-cli/package');
const log = require('@tyo-cli/log');

const SETTINGS = {
    init: '@tyo-cli/init'
};

function exec() {
    const targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;
    log.verbose('targetPath', targetPath);
    log.verbose('homePath', homePath);

    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = SETTINGS[cmdName];
    const packageVersion = 'latest';

    console.log(packageName);

    const pkg = new Package({
        targetPath,
        packageName,
        packageVersion
    });
}

module.exports = exec;