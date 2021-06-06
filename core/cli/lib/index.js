'use strict';

module.exports = core;

const semver = require('semver');
const log = require('@tyo-cli/log');
const colors = require('colors/safe');

const constract = require('./const');
const pkg = require('../package.json');

function core() {
    try {
        checkPkgVersion();
        checkNodeVersion();
        checkRoot();
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