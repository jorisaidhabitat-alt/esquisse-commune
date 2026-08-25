import {Route, Routes} from 'react-router-dom';
import {ScrollToTop} from './components/ScrollToTop';
import {AnalyticsTracker} from './components/AnalyticsTracker';
import {SiteFooter} from './components/SiteFooter';
import {SiteHeader} from './components/SiteHeader';
import {HomePage} from './pages/HomePage';
import {BlogIndexPage} from './pages/BlogIndexPage';
import {BlogPostPage} from './pages/BlogPostPage';
import {DeskRentalPage, MeetingRoomPage} from './pages/BusinessPages';
import {CgvPage, MentionsLegalesPage, PrivacyPolicyPage} from './pages/LegalPages';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-primary selection:text-white">
      <AnalyticsTracker />
      <ScrollToTop />
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bureaux-prives-chartres-de-bretagne" element={<DeskRentalPage />} />
        <Route path="/salle-reunion-chartres-de-bretagne" element={<MeetingRoomPage />} />
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
