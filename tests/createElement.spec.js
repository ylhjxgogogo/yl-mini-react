import React from "../../core/React";
import { it, expect, describe } from "vitest";
describe("createElement", () => {
  it("props is null,should return vdom for element", () => {
    const el = React.createElement("div", null, "hahha");
    expect(el).toMatchInlineSnapshot(
      `
          {
            "props": {
              "children": [
                {
                  "props": {
                    "children": [],
                    "nodeValue": "hahha",
                  },
                  "type": "TEXT_ELEMENT",
                },
              ],
            },
            "type": "div",
          }
        `
    );
  });
  it(" props is not empty,should return vdom for element", () => {
    const el = React.createElement("div", { id: "app" }, "hahha");
    expect(el).toMatchInlineSnapshot(
      `
      {
        "props": {
          "children": [
            {
              "props": {
                "children": [],
                "nodeValue": "hahha",
              },
              "type": "TEXT_ELEMENT",
            },
          ],
          "id": "app",
        },
        "type": "div",
      }
    `
    );
  });
});
