import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

export function ScrollToTop() {
  const {pathname, hash} = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const element = document.getElementById(hash.replace('#', ''));
    if (!element) {
      window.scrollTo(0, 0);
      return;
    }

    window.requestAnimationFrame(() => {
      element.scrollIntoView({behavior: 'auto', block: 'start'});
    });
  }, [pathname, hash]);

  return null;
}
