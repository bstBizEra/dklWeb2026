import config from "@payload-config";
import "@payloadcms/next/css";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import { Inter, Noto_Sans_Lao, Outfit } from "next/font/google";
import type { ServerFunctionClient } from "payload";
import type { ReactNode } from "react";

import { importMap } from "./admin/importMap";
import "./bizera-tokens.css";
import "./custom.scss";

// BizEra brandkit: Outfit display, Inter UI text, Noto Sans Lao for Lao content.
const notoSansLao = Noto_Sans_Lao({ subsets: ["lao", "latin"], variable: "--font-lao-admin", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-bizera-text", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-bizera-display", display: "swap" });

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction} htmlProps={{ className: `${inter.variable} ${outfit.variable} ${notoSansLao.variable}` }}>
      {children}
    </RootLayout>
  );
}
