## ciro-maciel - webpack-config

webpack configuration for development Applications


This is our shared [Webpack](http://webpack.github.io) config used for front-end projects at ciro-maciel.me. It compiles JavaScript with [Babel](https://babeljs.io). It is also configured to add hashes to filenames for easy caching.

### Getting Started

Install this package and Webpack via NPM:

```
npm install webpack @ciro-maciel/webpack-config --save-dev
```

Add some scripts to your `package.json`:

```js
{
  // ...
  "scripts": {
    "start": "webpack --env=development --hide-modules --watch",
    "build:dev": "webpack --env=development --hide-modules",
    "build": "webpack --env=production",
  }
}
```

Create a `webpack.config.js` in your project directory, and set it up like so:

```js
// webpack.config.js

var webpack = require('webpack');
var configure = require('@ciro-maciel/webpack-config');

module.exports = configure({
  entry: {
    // Add your bundles here, so in this case
    // ./src/app.js ==> ./dist/app-[hash].js
    app: './src/app.js',
  },

  // Override any other Webpack settings here!
  // see: https://webpack.js.org/configuration/
});
```

Now you can run `npm start` to build with source maps and watch for changes, and `npm run build` to build optimized assets for production! If you need to further customize your build, you can pass any overrides in to the configure function.

### License

&copy; ciro-maciel.me. Our Webpack config is free software, and may be redistributed under the
terms specified in the [LICENSE]() file. The
name and logo for ciro-maciel.me are trademarks of Ciro Cesar Maciel and may not be used without permission.
