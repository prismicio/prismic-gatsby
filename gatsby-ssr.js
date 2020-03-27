function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));

exports.onRenderBody = ({ setHeadComponents }, options) => {
    const src = `//prismic.io/prismic.js?repo=${options.repositoryName}`;
    const key = 'prismic-script';
    const toolbarScript = React.createElement('script', { key, src });
    /* TODO: make optional */
    setHeadComponents([toolbarScript]);
};
