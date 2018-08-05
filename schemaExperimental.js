"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseSchema = void 0;

var R = _interopRequireWildcard(require("ramda"));

var RA = _interopRequireWildcard(require("ramda-adjunct"));

var _gatsbyNodeHelpers = _interopRequireDefault(require("gatsby-node-helpers"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _createNodeHelpers = (0, _gatsbyNodeHelpers.default)({
  typePrefix: 'Prismic'
}),
    generateTypeName = _createNodeHelpers.generateTypeName;

var parseField = function parseField(type) {
  switch (type) {
    case 'Color':
    case 'Select':
    case 'Text':
    case 'UID':
      return 'string';

    case 'StructuredText':
      return 'html';

    case 'Number':
      return 'float';

    case 'Date':
    case 'Timestamp':
      return 'datetime';

    case 'GeoPoint':
      return 'geopoint';

    case 'Embed':
      return 'embed';

    case 'Image':
      return 'image';

    case 'Link':
      return 'link';

    default:
      return `UNPROCESSED FIELD for type "${field.type}"`;
  }
};

var normalizeFieldId = R.pipe( // Transform custom type name to GraphQL-aware name
R.replace(/^my\.([a-z_]*)\./, R.pipe(R.nthArg(1), generateTypeName, R.concat(R.__, '.'))), // Slice fields
R.replace(/\.non-repeat\./, '.primary.'), R.replace(/\.repeat\./, '.items.'), // Remove UUID
R.replace(/\$[a-z0-9]{8}(-[a-z0-9]{4}){3}-[a-z0-9]{12}\./, '.'));
var parseSchema = R.pipe(RA.renameKeysWith(normalizeFieldId), R.map(R.pipe(R.head, parseField)), R.toPairs, R.reduce(function (acc, _ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      path = _ref2[0],
      val = _ref2[1];

  return R.assocPath(R.split('.', path), val, acc);
}, {}));
exports.parseSchema = parseSchema;