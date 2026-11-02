import base from "./eslint.config.mjs";
export default [...base, { files: ["package.json"], plugins: { "n8n-nodes-base": (await import("eslint-plugin-n8n-nodes-base")).default }, rules: { "n8n-nodes-base/community-package-json-name-still-default": "error" } }];
