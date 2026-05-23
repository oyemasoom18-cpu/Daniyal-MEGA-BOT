function getType(varialble) {
  if (varialble === undefined) return "Undefined";
  if (varialble === null) return "Null";
  if (typeof varialble === "string") return "String";
  if (typeof varialble === "number") return "Number";
  if (typeof varialble === "boolean") return "Boolean";
  if (typeof varialble === "function") return "Function";
  if (Array.isArray(varialble)) return "Array";
  if (typeof varialble === "object") return "Object";
  return "Unknown";
}

module.exports = { getType };
module.exports.credits = "SARDAR RDX";
