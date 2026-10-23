import "../styles/globals.css";
import Head from "next/head";
import AppProviders from "../components/AppProviders";
import EdgeGlowEffect from "../components/EdgeGlowEffect";
import MobileBottomNav from "../components/MobileBottomNav";

const webLogo = process.env.NEXT_PUBLIC_WEB_LOGO || process.env.WEB_LOGO || "";

export default function NexaApp({ Component, pageProps }) {
  return (
    <AppProviders logoUrl={webLogo}>
      <Head>
        <title>Nexa News — The world, in focus</title>
        <meta name="description" content="A calm, fast news reader with a floating glass interface for the latest headlines, stories, and trending topics." />
        {webLogo ? <><link rel="icon" href={webLogo} /><link rel="apple-touch-icon" href={webLogo} /></> : null}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="app-shell"><Component {...pageProps} /></div>
      <EdgeGlowEffect />
      <MobileBottomNav />
    </AppProviders>
  );
}
