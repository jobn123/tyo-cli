'use strict';
const path = require('path');
const npminstall = require('npminstall');
const pkgDir = require('pkg-dir').sync;

const { isObject, fomartPath } = require('@tyo-cli/utils');
const { getDefaultRegistry } = require('@tyo-cli/get-npm-info')

class Package {
  constructor(options) {
    if (!options || !isObject(options)) {
      throw new Error('Package类的options参数不能为空！');
    }

    const { targetPath, packageName, packageVersion } = options;

    this.targetPath = targetPath;
    this.packageName = packageName;
    this.packageVersion = packageVersion;
    console.log(options);
  }

  exists(options) {

  }

  install() {
    npminstall({
      root: this.targetPath,
      storeDir: '',
      registry: getDefaultRegistry(),
      pkgs: [
        { name: this.packageName, version: this.packageVersion }
      ]
    })
  }

  update() {

  }

  getRootFilePath() {
    const dir = pkgDir(this.targetPath);
    if (dir) {
      const pkgFile = require(path.resolve(dir, 'package.json'));
      if (pkgFile && pkgFile.main) {
        return fomartPath(path.resolve(dir, pkgFile.main));
      }
    }

    return null;
  }
}

module.exports = Package;
