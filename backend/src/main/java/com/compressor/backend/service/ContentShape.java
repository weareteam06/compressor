package com.compressor.backend.service;

import com.fasterxml.jackson.databind.JsonNode;

/** Checks content structure without requiring default text or nonempty lists. */
public final class ContentShape {
  private ContentShape() {}

  public static boolean matches(JsonNode value, JsonNode template) {
    if (value == null || value.isNull()) return false;
    if (template.isObject()) {
      if (!value.isObject()) return false;
      var fields = template.fields();
      while (fields.hasNext()) {
        var field = fields.next();
        if (!matches(value.get(field.getKey()), field.getValue())) return false;
      }
      return true;
    }
    if (template.isArray()) {
      if (!value.isArray()) return false;
      if (template.isEmpty()) return true;
      for (JsonNode item : value) {
        boolean matched = false;
        for (JsonNode example : template) {
          if (matches(item, example)) { matched = true; break; }
        }
        if (!matched) return false;
      }
      return true;
    }
    return template.isTextual() ? value.isTextual()
        : template.isNumber() ? value.isNumber()
        : template.isBoolean() ? value.isBoolean() : value.getNodeType() == template.getNodeType();
  }
}
