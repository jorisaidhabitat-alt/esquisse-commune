import {Route, Routes} from 'react-router-dom';
import {ScrollToTop} from './components/ScrollToTop';
import {SiteFooter} from './components/SiteFooter';
import {SiteHeader} from './components/SiteHeader';
import {HomePage} from './pages/HomePage';
import {BlogIndexPage} from './pages/BlogIndexPage';
import {BlogPostPage} from './pages/BlogPostPage';
import {CgvPage, MentionsLegalesPage, PrivacyPolicyPage} from './pages/LegalPages';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-primary selection:text-white">
      <ScrollToTop />
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
        <Route path="/politique-confidentialite" element={<PrivacyPolicyPage />} />
        <Route path="/cgv" element={<CgvPage />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}
