'use strict';

const path = require('path');
const Package = require('@tyo-cli/package');
const log = require('@tyo-cli/log');

const SETTINGS = {
    init: 'tyo-cli'
};

const CACHE_DIR = 'dependencies';

async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;
    let storeDir = '';
    log.verbose('targetPath', targetPath);
    log.verbose('homePath', homePath);

    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = SETTINGS[cmdName];
    const packageVersion = 'latest';
    let pkg;

    if (!targetPath) {
        targetPath = path.resolve(homePath, CACHE_DIR);  // 生成缓存路径
        storeDir = path.resolve(targetPath, 'node_modules');
        log.verbose('targetPath', targetPath);
        log.verbose('storeDir', storeDir);

        pkg = new Package({
            targetPath,
            storeDir,
            packageName,
            packageVersion
        });

        if (await pkg.exists()) {
            // 更新
            console.log('>>>>>更新package');
        } else {
            // 安装
            await pkg.install();
        }
    } else {
        pkg = new Package({
            targetPath,
            packageName,
            packageVersion
        });
        const rootFile = pkg.getRootFilePath();
        require(rootFile).apply(null, arguments);
    }

}

module.exports = exec;