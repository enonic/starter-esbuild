import '/lib/nashorn/polyfills';

import serialize from 'serialize-javascript';
import {assetUrl} from '/lib/xp/portal'

/*
<script crossorigin src="https://unpkg.com/react@16.9.0/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@16.9.0/umd/react-dom.development.js"></script>
*/

export function get() {
  const props = {
    key: 'value'
  };
  return {
    body: `<html>
  <head>
    <script crossorigin src="${assetUrl({path:'js/react/react.development.js'})}"></script>
    <script crossorigin src="${assetUrl({path:'js/react-dom/react-dom.development.js'})}"></script>
    <link rel="stylesheet" type="text/css" href="${assetUrl({path:'style/all.min.css'})}"/>
    <title>React page</title>
  </head>
  <body>
    <form class="sass">
      <input placeholder="This text should be red"/>
    </form>
    <form class="stylus">
      <input placeholder="This text should be orange"/>
    </form>
    <form class="css">
      <input placeholder="This text should be green"/>
    </form>
    <form class="less">
      <input placeholder="This text should be blue"/>
    </form>
    <div id='react-container'></div>
    <script type="module" defer>
      import {aComponent} from '${assetUrl({path:'aComponent.mjs'})}';
      const propsObj = eval(${serialize(props)});
      ReactDOM.render(
        React.createElement(aComponent, [propsObj]),
        document.getElementById('react-container')
      );
    </script>
  </body>
</html>`
  }
}
