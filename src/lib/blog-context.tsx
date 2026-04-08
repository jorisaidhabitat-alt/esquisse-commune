import type {ReactNode} from 'react';
import {createContext, useContext} from 'react';
import type {BlogPageData} from './blog';

const BlogPageDataContext = createContext<BlogPageData | null>(null);

export function BlogPageDataProvider({value, children}: {value: BlogPageData | null; children: ReactNode}) {
  return <BlogPageDataContext.Provider value={value}>{children}</BlogPageDataContext.Provider>;
}

export function useBlogPageData() {
  return useContext(BlogPageDataContext);
}

