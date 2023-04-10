"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductCreated = void 0;
const pv3_1 = require("pv3");
const jsonschema_definer_1 = __importDefault(require("@bett3r-dev/jsonschema-definer"));
const ProductCreated = () => (0, pv3_1.Event)({
    schema: jsonschema_definer_1.default.shape({
        name: jsonschema_definer_1.default.string(),
    })
});
exports.ProductCreated = ProductCreated;
//# sourceMappingURL=productsAggregate.js.map