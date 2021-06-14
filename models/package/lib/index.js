'use strict';
const { isObject } = require('@tyo-cli/utils');

class Package {
  constructor(options) {
    console.log(">>>>> Package construction");
    if (!options || !isObject(options)) {
      throw new Error('Package类的options参数不能为空！');
    }

    const { targetPath, storePath, packageName, packageVersion } = options;
    console.log(options)
  }

  exists(options) {


  }

  install() {

  }

  update() {

  }

  getRootFilePath() { }
}

module.exports = Package;
