export type CatalogControl = {
  controlId: string;
  title: string;
  description: string;
  domain?: string;
};

export type Catalog = {
  version?: string;
  sourceUrl?: string;
  controls: CatalogControl[];
};

export type Catalogs = Record<string, Catalog>;

import { securityCatalogs } from "./security";
import { isoCatalogs } from "./iso";
import { privacyCatalogs } from "./privacy";
import { financialCatalogs } from "./financial";
import { healthcareCatalogs } from "./healthcare";
import { industryCatalogs } from "./industry";

export const catalogs: Catalogs = {
  ...securityCatalogs,
  ...isoCatalogs,
  ...privacyCatalogs,
  ...financialCatalogs,
  ...healthcareCatalogs,
  ...industryCatalogs,
};
