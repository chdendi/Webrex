import { describe, expect, it } from 'vitest';
import { md, mdGlossary } from './markdown';

describe('markdown rendering', () => {
  it('removes executable attributes from raw lesson HTML', () => {
    const html = md('<img src=x onerror=alert(1)>');

    expect(html).not.toContain('onerror');
    expect(html).not.toContain('<img');
  });

  it('keeps controlled glossary markup', () => {
    const html = mdGlossary('CORS');

    expect(html).toContain('class="glossary"');
    expect(html).toContain('data-glossary-term="CORS"');
  });
});
