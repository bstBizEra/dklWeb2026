import config from "@payload-config";
import "@payloadcms/next/css";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import { Noto_Sans_Lao } from "next/font/google";
import type { ServerFunctionClient } from "payload";
import type { ReactNode } from "react";

import { importMap } from "./admin/importMap";
import "./custom.scss";

// BizEra sets their whole site in Noto Sans Lao, and the editors here type Lao into most fields, so the
// panel uses it for both scripts. custom.scss reads it through --font-lao-admin.
const notoSansLao = Noto_Sans_Lao({ subsets: ["lao", "latin"], variable: "--font-lao-admin", display: "swap" });

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction} htmlProps={{ className: notoSansLao.variable }}>
      {children}
    </RootLayout>
  );
}
