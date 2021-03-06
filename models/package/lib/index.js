'use strict';
const path = require('path');
const npminstall = require('npminstall');
const pkgDir = require('pkg-dir').sync;
const pathExists = require('path-exists').sync;
const fse = require('fs-extra');

const { isObject, fomartPath } = require('@tyo-cli/utils');
const { getDefaultRegistry, getNpmLatestVersion } = require('@tyo-cli/get-npm-info')

class Package {
  constructor(options) {
    if (!options || !isObject(options)) {
      throw new Error('Package类的options参数不能为空！');
    }

    const { targetPath, packageName, packageVersion, storeDir } = options;

    this.targetPath = targetPath;
    this.packageName = packageName;
    this.packageVersion = packageVersion;
    this.storeDir = storeDir;
    this.latestPackageVersion = 'latest';
  }

  async prepare() {
    if (this.storeDir && !pathExists(this.storeDir)) {
      fse.mkdirSync(this.storeDir);
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName)
    }
  }

  get cacheFilePath() {
    const cacheFilePathPrefix = this.packageName.replace('/', '_');
    return path.resolve(this.storeDir, `_${cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`);
  }

  get getSpecificCacheFilePath() {
    const cacheFilePathPrefix = this.packageName.replace('/', '_');
    return path.resolve(this.storeDir, `_${cacheFilePathPrefix}@${this.latestPackageVersion}@${this.packageName}`);
  }

  async exists() {
    if (this.storeDir) {
      await this.prepare();
      return pathExists(this.cacheFilePath);
    } else {
      return pathExists(this.targetPath)
    }
  }

  async install() {
    await this.prepare();
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        { name: this.packageName, version: this.packageVersion }
      ]
    });
  }

  async update() {
    await this.prepare();
    const latestPackageVersion = await getNpmLatestVersion(this.packageName);
    this.latestPackageVersion = latestPackageVersion;
    const latestFilePath = this.getSpecificCacheFilePath;

    if (!pathExists(latestFilePath)) {
      return npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [
          { name: this.packageName, version: latestPackageVersion }
        ]
      });
    }
  }

  getRootFilePath() {
    function _getRootFilePath(targetPath) {
      const dir = pkgDir(targetPath);
      if (dir) {
        const pkgFile = require(path.resolve(dir, 'package.json'));
        if (pkgFile && pkgFile.main) {
          return fomartPath(path.resolve(dir, pkgFile.main));
        }
      }
      return null;
    }

    if (this.storeDir) {
      return _getRootFilePath(this.cacheFilePath);
    } else {
      return _getRootFilePath(this.targetPath);
    }
  }
}

module.exports = Package;
