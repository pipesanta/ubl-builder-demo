import { Route, Routes } from 'react-router-dom'
import './App.css'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { InvoiceBuilderPage } from './pages/InvoiceBuilderPage'
import { CreditNoteBuilderPage } from './pages/CreditNoteBuilderPage'
import { DataTypesPage } from './pages/DataTypesPage'
import { ComponentsPage } from './pages/ComponentsPage'
import { DianExtensionPage } from './pages/DianExtensionPage'
import { ToolsPage } from './pages/ToolsPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/invoice" element={<InvoiceBuilderPage />} />
        <Route path="/credit-note" element={<CreditNoteBuilderPage />} />
        <Route path="/data-types" element={<DataTypesPage />} />
        <Route path="/components" element={<ComponentsPage />} />
        <Route path="/dian" element={<DianExtensionPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}

export default App
