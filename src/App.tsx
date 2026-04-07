import {lazy, Suspense} from 'react';
import {Route, Routes} from 'react-router-dom';
import {ScrollToTop} from './components/ScrollToTop';
import {SiteFooter} from './components/SiteFooter';
import {SiteHeader} from './components/SiteHeader';
import {HomePage} from './pages/HomePage';
const MentionsLegalesPage = lazy(async () => {
  const module = await import('./pages/LegalPages');
  return {default: module.MentionsLegalesPage};
});

const PrivacyPolicyPage = lazy(async () => {
  const module = await import('./pages/LegalPages');
  return {default: module.PrivacyPolicyPage};
});

const CgvPage = lazy(async () => {
  const module = await import('./pages/LegalPages');
  return {default: module.CgvPage};
});

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-primary selection:text-white">
      <ScrollToTop />
      <SiteHeader />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
          <Route path="/politique-confidentialite" element={<PrivacyPolicyPage />} />
          <Route path="/cgv" element={<CgvPage />} />
        </Routes>
      </Suspense>
      <SiteFooter />
    </div>
  );
}
