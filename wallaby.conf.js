module.exports = () => {
  return {
    autoDetect: true,
    trace: true,
    hints: {
      ignoreCoverage: /istanbul ignore next/
    },
  };
};
