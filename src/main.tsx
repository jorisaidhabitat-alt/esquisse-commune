import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import {getInitialBlogPageData} from './lib/blog';
import {BlogPageDataProvider} from './lib/blog-context';

const container = document.getElementById('root')!;
const initialBlogData = getInitialBlogPageData();

const app = (
  <StrictMode>
    <BlogPageDataProvider value={initialBlogData}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </BlogPageDataProvider>
  </StrictMode>
);

if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
