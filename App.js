import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from './store';
import Root from './Root';

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
