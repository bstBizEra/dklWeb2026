import type { Field, GlobalConfig } from "payload";

import { noConfirmMarker } from "../../lib/data/confirm";
import { getRoute } from "../../lib/data/routes";
import { anyone, isOwnerOrEditor } from "../access";

const knownRoute = (value: unknown): true | string =>
  !value || (typeof value === "string" && getRoute(value)) ? true : "Unknown route id. Use an id from the route registry.";

const routeId = (required: boolean): Field => ({
  name: "routeId",
  type: "text",
  required,
  validate: knownRoute,
  admin: { description: "Route registry id, for example rental or maintenance. The link is hidden while that page is unpublished." },
});

// The header menu. An item with links becomes a dropdown; an item with only a page is a direct link.
export const Navigation: GlobalConfig = {
  slug: "navigation",
  label: "Menu",
  admin: { description: "The header menu. Leave it empty to use the built-in menu." },
  access: { read: anyone, update: isOwnerOrEditor },
  fields: [
    {
      name: "items",
      type: "array",
      labels: { singular: "Menu item", plural: "Menu items" },
      fields: [
        { name: "label", type: "text", required: true, validate: noConfirmMarker },
        routeId(false),
        {
          name: "children",
          label: "Dropdown links",
          type: "array",
          admin: { description: "Add links to turn this item into a dropdown. The page above is then ignored." },
          fields: [
            { name: "label", type: "text", required: true, validate: noConfirmMarker },
            routeId(true),
            { name: "description", type: "text", validate: noConfirmMarker },
          ],
        },
      ],
    },
  ],
};
