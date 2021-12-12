import React from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { ContextProvider } from '../context';
import '../styles/auth.css';
import '../styles/chats.css';
import '../styles/index.css';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <React.Fragment>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ContextProvider>
        <Component {...pageProps} />
      </ContextProvider>
    </React.Fragment>
  );
}
