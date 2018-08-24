"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseSchema = void 0;

var R = _interopRequireWildcard(require("ramda"));

var RA = _interopRequireWildcard(require("ramda-adjunct"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var parseField = function parseField(field) {
  switch (field.type) {
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

    case 'Group':
      return R.pipe(R.path(['config', 'fields']), R.map(parseField))(field);

    case 'Slice':
      return R.pipe(R.pick(['non-repeat', 'repeat']), RA.renameKeys({
        'non-repeat': 'primary',
        repeat: 'items'
      }), R.map(R.map(parseField)))(field);

    case 'Slices':
      return parseSchema(field.config);

    default:
      return `UNPROCESSED FIELD for type "${field.type}"`;
  }
};

var parseSchema = R.pipe(R.values, R.mergeAll, R.map(parseField));
exports.parseSchema = parseSchema;