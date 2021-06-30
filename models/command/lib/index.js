'use strict';
const semver = require('semver');
const colors = require('colors/safe');

const log = require('@tyo-cli/log');

const LOWEST_NODE_VERSION = '13.0.0';

class Command {
    constructor(argv) {

        if (!argv || argv.length < 1) {
            throw new Error('参数不能为空')
        }

        if (!Array.isArray(argv)) {
            throw new Error('参数必须为数组')
        }

        this._argv = argv;

        let runner = new Promise((resolve, reject) => {
            let chain = Promise.resolve();
            chain = chain.then(() => this.checkNodeVersion());
            chain = chain.then(() => this.initArgs());
            chain = chain.then(() => this.init());
            chain = chain.then(() => this.exec());
            chain.catch(err => {
                // console.log(err.message);
                log.error(err.message);
            })
        })
    }

    checkNodeVersion() {
        const CURRENT_NODE_VERSION = process.version;
        if (!semver.gte(CURRENT_NODE_VERSION, LOWEST_NODE_VERSION)) {
            throw new Error(colors.red(`tyo-cli 需要安装 v${LOWEST_NODE_VERSION} 以上版本的Node.js`));
        }
    }

    initArgs() {
        this._cmd = this._argv[this._argv.length - 2];
        this._argv = this._argv.slice(0, this._argv.length - 1);
    }

    init() {
        throw new Error('init 必须实现');
    }

    exec() {
        throw new Error('exec 必须实现');
    }
}

module.exports = Command;
