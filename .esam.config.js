/** @type {import('@bett3r-dev/pv3-utils-cli').CLIOptions} */
module.exports = {
  templatesUrlBase: 'https://github.com/bett3r-dev/pv3-templates/archive/refs/heads/',
  domainDirectory: './domain-events',
  servicesGlobPatterns: [ './services/**/*', './service' ],
  createWebApp: true,
  webappDirectory: './webapp',
  clientLibraryDirectory: './client-library'
};
