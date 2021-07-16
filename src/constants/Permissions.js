/**
 * Apple Health Permissions Availability
 * A map of human-readable permission strings to their supported OS versions.
 * 
 * @type {Object}
 */
export const PermissionAvailability = {
  // PermissionKey: [min iOS Version, max iOS Version (optional)]
  Vo2Max: [11.0],
};

/**
 * Apple Health Permissions
 *
 * @type {Object}
 */
export const Permissions = Object.keys(PermissionAvailability)
  .reduce((ret, perm) => ({ ...ret, [perm]: perm }), {});
