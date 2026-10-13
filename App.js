import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from './src/store';
import Root from './src/Root';

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
