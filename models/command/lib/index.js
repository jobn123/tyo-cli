'use strict';
const semver = require('semver');
const colors = require('colors/safe');

const LOWEST_NODE_VERSION = '13.0.0';

class Command {
    constructor(argv) {
        console.log('>>>>>Command constructor');
        this._argv = argv;
        let runner = new Promise((resolve, reject) => {
            let chain = Promise.resolve();
            chain = chain.then(() => this.checkNodeVersion());
        })
    }

    checkNodeVersion() {
        const CURRENT_NODE_VERSION = process.version;
        if (!semver.gte(CURRENT_NODE_VERSION, LOWEST_NODE_VERSION)) {
            throw new Error(colors.red(`tyo-cli 需要安装 v${LOWEST_NODE_VERSION} 以上版本的Node.js`));
        }
    }

    init() {
        throw new Error('init 必须实现');
    }

    exec() {
        throw new Error('exec 必须实现');
    }
}

module.exports = Command;
