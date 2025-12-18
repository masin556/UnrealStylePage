import React from 'react';
import { SelectionProvider, useSelection } from './context/SelectionContext';
import { Layout } from './components/layout/Layout';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/panels/Sidebar';
import { GraphEditor } from './components/graph/GraphEditor';
import { DetailsPanel } from './components/panels/DetailsPanel';
import { ContentBrowser } from './components/panels/ContentBrowser';
import { ContactModal } from './components/common/ContactModal';
import { CopyrightProtector } from './components/common/CopyrightProtector';
import { SettingsModal } from './components/common/SettingsModal';
import { ConfirmationModal } from './components/common/ConfirmationModal'; // [NEW]

const Main = () => {
  const {
    isContactOpen,
    closeContact,
    isSettingsOpen,
    closeSettings,
    confirmationState,
    closeConfirmation,
    handleConfirm
  } = useSelection();

  return (
    <>
      <Layout
        topBar={<TopBar />}
        sidebar={<Sidebar />}
        main={<GraphEditor />}
        details={<DetailsPanel />}
        bottom={<ContentBrowser />}
      />
      {isContactOpen && <ContactModal onClose={closeContact} />}
      {isSettingsOpen && <SettingsModal onClose={closeSettings} />}
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        title={confirmationState.title}
        message={confirmationState.message}
        onConfirm={handleConfirm}
        onCancel={closeConfirmation}
        isDanger={confirmationState.isDanger}
      />
      <CopyrightProtector />
    </>
  );
};

function App() {
  return (
    <SelectionProvider>
      <Main />
    </SelectionProvider>
  );
}

export default App;
