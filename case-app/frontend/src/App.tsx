import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import CaseFrontPage from './pages/CaseFrontPage';
import CorpusPage from './pages/CorpusPage';
import SuspectScoringPage from './pages/SuspectScoringPage';
import SuspectDetailPage from './pages/SuspectDetailPage';
import HypothesisPage from './pages/HypothesisPage';
import EvidenceExplorerPage from './pages/EvidenceExplorerPage';
import OdiDbtWizardPage from './pages/OdiDbtWizardPage';
import WizardLivePage from './pages/WizardLivePage';
import ModelCardPage from './pages/ModelCardPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<CaseFrontPage />} />
          <Route path="/corpus" element={<CorpusPage />} />
          <Route path="/scoring" element={<SuspectScoringPage />} />
          <Route path="/suspect/:id" element={<SuspectDetailPage />} />
          <Route path="/hypothesis" element={<HypothesisPage />} />
          <Route path="/evidence" element={<EvidenceExplorerPage />} />
          <Route path="/model" element={<ModelCardPage />} />
          <Route path="/dbt-wizard" element={<OdiDbtWizardPage />} />
          <Route path="/wizard-live" element={<WizardLivePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
