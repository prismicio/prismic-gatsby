"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePrismicPreview = void 0;

var _react = require("react");

var _prismicJavascript = _interopRequireDefault(require("prismic-javascript"));

var _qs = _interopRequireDefault(require("qs"));

var Cookies = _interopRequireWildcard(require("es-cookie"));

var _camelcase = require("camelcase");

var _normalizeBrowser = require("./normalizeBrowser");

var _nodeHelpers = require("./nodeHelpers");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Returns normalized Prismic preview data for a provided location object from
// gatsby.
const usePrismicPreview = (location, customType, linkResolver, htmlSerializer, fetchLinks, repositoryName, accessToken) => {
  const apiEndpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`; // Hook helper functions:
  // Returns the UID associated with the current preview session.

  const getPreviewUID =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(function* () {
      try {
        const params = _qs.default.parse(location.search.slice(1));

        const api = yield _prismicJavascript.default.getApi(apiEndpoint, {
          accessToken
        });
        const url = yield api.previewSession(params.token, linkResolver, '/');
        const uid = url === '/' ? 'home' : url.split('/').pop();
        Cookies.set(_prismicJavascript.default.previewCookie, params.token);
        return {
          uid,
          api
        };
      } catch (error) {
        console.error('Error fetching Prismic preview UID: ', error);
        return false;
      }
    });

    return function getPreviewUID() {
      return _ref.apply(this, arguments);
    };
  }(); // Returns the raw preview data API response from Prismic.


  const getRawPreviewData =
  /*#__PURE__*/
  function () {
    var _ref2 = _asyncToGenerator(function* () {
      try {
        const {
          uid,
          api
        } = yield getPreviewUID();
        return yield api.getByUID(customType, uid, fetchLinks);
      } catch (error) {
        console.error('Error fetching Prismic preview data: ', error);
        return false;
      }
    });

    return function getRawPreviewData() {
      return _ref2.apply(this, arguments);
    };
  }(); // Returns Prismic Preview data that has the same shape as a Gatsby Prismic
  // data node.


  const normalizePreviewData =
  /*#__PURE__*/
  function () {
    var _ref3 = _asyncToGenerator(function* () {
      const doc = yield getRawPreviewData();
      const Node = (0, _nodeHelpers.createNodeFactory)(doc.type,
      /*#__PURE__*/
      function () {
        var _ref4 = _asyncToGenerator(function* (node) {
          node.data = yield (0, _normalizeBrowser.normalizeBrowserFields)({
            value: node.data,
            node,
            linkResolver: () => linkResolver,
            htmlSerializer: () => htmlSerializer,
            nodeHelpers: _nodeHelpers.nodeHelpers,
            shouldNormalizeImage: () => true
          });
          return node;
        });

        return function (_x) {
          return _ref4.apply(this, arguments);
        };
      }());
      const node = yield Node(doc);
      const prefixedType = (0, _camelcase.camelCase)(node.internal.type); // Reconstruct the node's body to match how Gatsby reconstructs it at build
      // time.

      const sliceBody = node.data.body.map(slice => ({
        id: slice.id,
        primary: slice.primary,
        __typename: slice.internal.type
      }));
      return {
        [prefixedType]: {
          data: _objectSpread({}, node.data, {
            body: sliceBody
          }),
          uid: node.uid
        }
      };
    });

    return function normalizePreviewData() {
      return _ref3.apply(this, arguments);
    };
  }();

  const asyncEffect =
  /*#__PURE__*/
  function () {
    var _ref5 = _asyncToGenerator(function* (setPreviewData, setLoading) {
      const data = yield normalizePreviewData(location);
      setPreviewData(data);
      setLoading(false);
    });

    return function asyncEffect(_x2, _x3) {
      return _ref5.apply(this, arguments);
    };
  }();

  const [previewData, setPreviewData] = (0, _react.useState)(null);
  const [isLoading, setLoading] = (0, _react.useState)(true);
  (0, _react.useEffect)(() => {
    asyncEffect(setPreviewData, setLoading);
  });
  return {
    previewData,
    isLoading
  };
};

exports.usePrismicPreview = usePrismicPreview;