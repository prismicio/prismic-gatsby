"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeBrowserFields = exports.normalizeField = exports.isGroupField = exports.isSliceField = exports.isImageField = exports.isLinkField = exports.isRichTextField = void 0;

var _prismicDom = _interopRequireDefault(require("prismic-dom"));

var _asyncro = require("asyncro");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Returns true if the field value appears to be a Rich Text field, false
// otherwise.
const isRichTextField = value => Array.isArray(value) && typeof value[0] === 'object' && Object.keys(value[0]).includes('spans'); // Returns true if the field value appears to be a Link field, false otherwise.


exports.isRichTextField = isRichTextField;

const isLinkField = value => value !== null && typeof value === 'object' && value.hasOwnProperty('link_type'); // Returns true if the field value appears to be an Image field, false
// otherwise.


exports.isLinkField = isLinkField;

const isImageField = value => value !== null && typeof value === 'object' && value.hasOwnProperty('url') && value.hasOwnProperty('dimensions') && value.hasOwnProperty('alt') && value.hasOwnProperty('copyright'); // Returns true if the key and value appear to be from a slice zone field,
// false otherwise.


exports.isImageField = isImageField;

const isSliceField = value => Array.isArray(value) && typeof value[0] === 'object' && value[0].hasOwnProperty('slice_type') && (value[0].hasOwnProperty('primary') || value[0].hasOwnProperty('items')); // Returns true if the field value appears to be a group field, false
// otherwise.
// NOTE: This check must be performed after isRichTextField and isSliceField.


exports.isSliceField = isSliceField;

const isGroupField = value => Array.isArray(value) && typeof value[0] === 'object'; // Normalizes a rich text field by providing HTML and text versions of the
// value using `prismic-dom` on the `html` and `text` keys, respectively. The
// raw value is provided on the `raw` key.


exports.isGroupField = isGroupField;

const normalizeRichTextField = (value, linkResolver, htmlSerializer) => ({
  html: _prismicDom.default.RichText.asHtml(value, linkResolver, htmlSerializer),
  text: _prismicDom.default.RichText.asText(value),
  raw: value
}); // Normalizes a link field by providing a resolved URL using `prismic-dom` on
// the `url` field. If the value is an external link, the value is provided
// as-is. If the value is a document link, the document's data is provided on
// the `document` key.


const normalizeLinkField = (value, linkResolver) => {
  switch (value.link_type) {
    case 'Document':
      if (!value.type || !value.id || value.isBroken) return undefined;
      return _objectSpread({}, value, {
        url: _prismicDom.default.Link.url(value, linkResolver),
        target: value.target || '',
        raw: value
      });

    case 'Media':
    case 'Web':
      return _objectSpread({}, value, {
        target: value.target || '',
        raw: value
      });

    default:
      return undefined;
  }
}; // Normalizes an Image field.


const normalizeImageField =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (_ref) {
    let {
      value
    } = _ref,
        args = _objectWithoutProperties(_ref, ["value"]);

    const {
      alt,
      copyright
    } = value,
          extraFields = _objectWithoutProperties(value, ["alt", "copyright"]);

    for (const key in extraFields) {
      if (isImageField(value[key])) {
        value[key] = yield normalizeImageField(_objectSpread({}, args, {
          key,
          value: value[key]
        }));
      }
    }

    return _objectSpread({}, value, {
      alt: alt || '',
      copyright: copyright || ''
    });
  });

  return function normalizeImageField(_x) {
    return _ref2.apply(this, arguments);
  };
}(); // Normalizes a slice zone field by recursively normalizing `item` and
// `primary` keys. It creates a node type for each slice type to ensure the
// slice key can handle multiple (i.e. union) types.


const normalizeSliceField =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(function* (args) {
    const {
      key: sliceKey,
      value: entries,
      node,
      nodeHelpers
    } = args;
    const {
      createNodeFactory
    } = nodeHelpers;
    const children = yield (0, _asyncro.map)(entries,
    /*#__PURE__*/
    function () {
      var _ref4 = _asyncToGenerator(function* (entry, index) {
        // Create unique ID for the child using the parent node ID, the slice key,
        // and the index of the slice.
        entry.id = `${node.id}__${sliceKey}__${index}`;
        const entryNodeType = `${node.type}_${sliceKey}_${entry.slice_type}`;
        const EntryNode = createNodeFactory(entryNodeType,
        /*#__PURE__*/
        function () {
          var _ref5 = _asyncToGenerator(function* (entryNode) {
            entryNode.items = yield normalizeGroupField(_objectSpread({}, args, {
              value: entryNode.items
            }));
            entryNode.primary = yield normalizeBrowserFields(_objectSpread({}, args, {
              value: entryNode.primary
            }));
            return entryNode;
          });

          return function (_x5) {
            return _ref5.apply(this, arguments);
          };
        }());
        const entryNode = yield EntryNode(entry);
        return entryNode;
      });

      return function (_x3, _x4) {
        return _ref4.apply(this, arguments);
      };
    }());
    return children;
  });

  return function normalizeSliceField(_x2) {
    return _ref3.apply(this, arguments);
  };
}(); // Normalizes a group field by recursively normalizing each entry.


const normalizeGroupField =
/*#__PURE__*/
function () {
  var _ref6 = _asyncToGenerator(function* (args) {
    return yield (0, _asyncro.map)(args.value,
    /*#__PURE__*/
    function () {
      var _ref7 = _asyncToGenerator(function* (value) {
        return yield normalizeBrowserFields(_objectSpread({}, args, {
          value
        }));
      });

      return function (_x7) {
        return _ref7.apply(this, arguments);
      };
    }());
  });

  return function normalizeGroupField(_x6) {
    return _ref6.apply(this, arguments);
  };
}(); // Normalizes a field by determining its type and returning an enhanced version
// of it. If the type is not supported or needs no normalizing, it is returned
// as-is.


const normalizeField =
/*#__PURE__*/
function () {
  var _ref8 = _asyncToGenerator(function* (args) {
    const {
      key,
      value,
      node,
      nodeHelpers,
      shouldNormalizeImage
    } = args;
    let {
      linkResolver,
      htmlSerializer
    } = args;
    const {
      generateNodeId
    } = nodeHelpers;
    linkResolver = linkResolver({
      node,
      key,
      value
    });
    htmlSerializer = htmlSerializer({
      node,
      key,
      value
    });
    if (isRichTextField(value)) return normalizeRichTextField(value, linkResolver, htmlSerializer);
    if (isLinkField(value)) return normalizeLinkField(value, linkResolver, generateNodeId);
    if (isImageField(value) && typeof shouldNormalizeImage === 'function' && shouldNormalizeImage({
      node,
      key,
      value
    })) return yield normalizeImageField(args);
    if (isSliceField(value)) return yield normalizeSliceField(args);
    if (isGroupField(value)) return yield normalizeGroupField(args);
    return value;
  });

  return function normalizeField(_x8) {
    return _ref8.apply(this, arguments);
  };
}(); // Normalizes all fields in a key-value object.


exports.normalizeField = normalizeField;

const normalizeBrowserFields =
/*#__PURE__*/
function () {
  var _ref9 = _asyncToGenerator(function* (args) {
    return yield (0, _asyncro.reduce)(Object.entries(args.value),
    /*#__PURE__*/
    function () {
      var _ref10 = _asyncToGenerator(function* (acc, [key, value]) {
        acc[key] = yield normalizeField(_objectSpread({}, args, {
          key,
          value
        }));
        return acc;
      });

      return function (_x10, _x11) {
        return _ref10.apply(this, arguments);
      };
    }(), args.value);
  });

  return function normalizeBrowserFields(_x9) {
    return _ref9.apply(this, arguments);
  };
}();

exports.normalizeBrowserFields = normalizeBrowserFields;