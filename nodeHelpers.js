"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateTypeName = exports.createNodeFactory = exports.nodeHelpers = void 0;

var _gatsbyNodeHelpers = _interopRequireDefault(require("gatsby-node-helpers"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const nodeHelpers = (0, _gatsbyNodeHelpers.default)({
  typePrefix: 'Prismic'
});
exports.nodeHelpers = nodeHelpers;
const {
  createNodeFactory,
  generateTypeName
} = nodeHelpers;
exports.generateTypeName = generateTypeName;
exports.createNodeFactory = createNodeFactory;