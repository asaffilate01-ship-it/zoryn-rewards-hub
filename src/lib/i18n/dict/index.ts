import { common } from "./common";
import { public_ } from "./public";
import { legal } from "./legal";
import { app } from "./app";
import { merchant } from "./merchant";
import { admin } from "./admin";
import { platform } from "./platform";

export const en: Record<string, string> = {
  ...common,
  ...public_,
  ...legal,
  ...app,
  ...merchant,
  ...admin,
  ...platform,
};
