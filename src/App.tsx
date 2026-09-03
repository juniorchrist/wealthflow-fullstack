/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppShell } from './components/layout/AppShell';
import { WealthProvider } from './context/WealthContext';

export default function App() {
  return (
    <WealthProvider>
      <AppShell />
    </WealthProvider>
  );
}
