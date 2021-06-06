'use strict';

module.exports = core;

const path = require('path');
const semver = require('semver');
const log = require('@tyo-cli/log');

const colors = require('colors/safe');
const userHome = require('user-home');
const pathExists = require('path-exists').sync;

const constract = require('./const');
const pkg = require('../package.json');

function core() {
    try {
        checkPkgVersion();
        checkNodeVersion();
        checkRoot();
        checkUserHome();
        checkInputArgs();
        checkEnv();
        checkGlobalUpdate();
        // log.verbose('debug', 'test debug');
    } catch (error) {
        log.error(error.message);
    }
}

function checkPkgVersion() {
    log.info('cli', pkg.version);
}

function checkNodeVersion() {
    const CURRENT_NODE_VERSION = process.version;
    const LOWEST_NODE_VERSION = constract.LOWEST_NODE_VERSION;

    if (!semver.gte(CURRENT_NODE_VERSION, LOWEST_NODE_VERSION)) {
        throw new Error(colors.red(`tyo-cli 需要安装 v${LOWEST_NODE_VERSION} 以上版本的Node.js`));
    }
}

function checkRoot() {
    const rootCheck = require('root-check');
    rootCheck();
}

function checkUserHome() {
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red('当前登录用户主目录不存在！'));
    }
}

function checkInputArgs() {
    const minimist = require('minimist');
    const args = minimist(process.argv.slice(2));
    checkArgs(args)
}

function checkArgs(args) {
    if (args.debug) {
        process.env.LOG_LEVEL = 'verbose';
    } else {
        process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
}

function checkEnv() {
    const dotenv = require('dotenv');
    const dotenvPath = path.resolve(userHome, '.env');

    if (pathExists(dotenvPath)) {
        dotenv.config({ path: dotenvPath });
    }

    createDefaultConfig();

    log.verbose('环境变量', process.env.CLI_HOME_PATH);
}

function createDefaultConfig() {
    const cliConfig = {
        home: userHome
    };

    if (process.env.CLI_HOME) {
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
    } else {
        cliConfig['cliHome'] = path.join(userHome, constract.DEFAULT_CLI_HOME);
    }

    process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

async function checkGlobalUpdate() {
    const { version, name } = pkg
    const { getNpmSemverVersion } = require('@tyo-cli/get-npm-info');

    const lastVersion = await getNpmSemverVersion(version, name);

    if (lastVersion && semver.gt(lastVersion, version)) {
        log.warn(colors.yellow(`please update to latest version ${name}， current version: ${version}，latest version: ${lastVersion}
            更新命令： npm install -g ${name}`));
    }
}