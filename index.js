import { Platform } from 'react-native';
import { Activities, Functions, Observers, Permissions, PermissionAvailability, Units } from './src/constants'

const { AppleHealthKit } = require('react-native').NativeModules;

// Checks a given permission to determine if it is available for the
// current iOS version.
const isPermissionAvailable = (perm) => {
  const osVersion = parseFloat(Platform.Version);
  const [minVerion, maxVersion] = PermissionAvailability[perm] || [];
 // minVersion is required, max version is optional, return true if the os version falls
 // between min and max [inclusive]
 return minVerion && osVersion >= minVerion && (!maxVersion || osVersion <= maxVersion);
}

// Wrap the initHealthKit call to pre-process the requested permissions
// and strip out any that are not available for the version of iOS that
// is running on the device. Error checking will be handled by the 
// underlying native method.
const initHealthKit = (options, callback) => {
  const { read, write } = options?.permissions || {};
  const opts = {
    permissions: {
      read: read && read.filter(perm => isPermissionAvailable(perm)),
      write: write && write.filter(perm => isPermissionAvailable(perm)),
    }
  }
  return AppleHealthKit.initHealthKit(opts, callback);
};

// Wrap Function calls with a version check so that a consumer of this library
// doesn't need to keep track of which APIs are available for each iOS version.
const functions = Object.keys(Functions).reduce((ret, func) => {
  const perms = Functions[func];
  const isAvailable = perms.reduce((result, perm) => result && isPermissionAvailable(perm), true);
  // If the function is not available, replace with a mock function that immediately calls the 
  // supplied callback function with an error.
  return Object.assign(ret, {
    [func]: isAvailable && AppleHealthKit[func] ? AppleHealthKit[func] : (_, callback) => {
      if (callback) {
        callback(new Error(`${func} is not available for this iOS version.`));
      }
    }
  });
}, {});

export const HealthKit = Object.assign({}, AppleHealthKit, functions, {
  initHealthKit,
  Constants: {
    Activities,
    Observers,
    Permissions,
    Units,
  },
})

module.exports = HealthKit
