// Load CSVs, like create-react-app
// Adapted from https://storybook.js.org/configurations/custom-webpack-config/#full-control-mode-default
const genDefaultConfig = require('@storybook/react/dist/server/config/defaults/webpack.config.js');
module.exports = (baseConfig, env) => { //eslint-disable-line no-undef
  const config = genDefaultConfig(baseConfig, env);

  config.module.rules.push({ test: "^.+\\.jsx?$", loader: "babel-jest" });
  config.module.rules.push({ test: "^.+\\.s?css$", loader: "./ui/config/cssTransform.js" });

  return config;
};