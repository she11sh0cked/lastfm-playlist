import React, { useEffect } from "react";
import { AppProps } from "next/dist/next-server/lib/router/router";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import Head from "next/head";
import theme from "../src/theme";

export default function MyApp(props: AppProps): JSX.Element {
  const { Component, pageProps } = props;

  useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) jssStyles.parentElement.removeChild(jssStyles);
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Last FM Playlist</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </React.Fragment>
  );
}
