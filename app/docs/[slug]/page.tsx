import { notFound } from 'next/navigation';
import { docsContent, docsNavigation } from '@/lib/data/docs';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
}));

export async function generateStaticParams() {
  const slugs = Object.keys(docsContent);
  return slugs.map((slug) => ({ slug }));
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const content = docsContent[slug];
  
  if (!content) {
    notFound();
  }

  // Parse markdown
  const htmlContent = await marked.parse(content);

  return (
    <article 
      className="prose prose-lg prose-invert max-w-none prose-pre:p-0 prose-pre:border prose-pre:border-white/10 prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-accent pb-24"
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
}
