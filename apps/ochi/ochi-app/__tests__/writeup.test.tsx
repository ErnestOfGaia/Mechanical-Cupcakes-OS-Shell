import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { readWriteup } from '../lib/writeup'
import UnderTheHood from '../app/under-the-hood/page'

// One source, two surfaces: the page must render WRITEUP.md, and the file must
// obey the two content rules from Last Mile Plan § 4b — no YAML front-matter
// (renders as literal text) and no markdown images (a real cross-origin request).

describe('WRITEUP.md and /under-the-hood', () => {
  const md = readWriteup()

  it('the file exists, opens with a single # title, and has no front-matter', () => {
    expect(md.startsWith('# ')).toBe(true)
    expect(md.startsWith('---')).toBe(false)
  })

  it('contains no markdown images', () => {
    expect(md).not.toMatch(/!\[[^\]]*\]\(/)
  })

  it('the page renders the file — the title and a body sentence come through', () => {
    const html = renderToStaticMarkup(React.createElement(UnderTheHood))
    expect(html).toContain('OCHI: development and architecture')
    expect(html).toContain('A check-in, not a planner')
    expect(html).toContain('under-the-hood')
    // Front-matter or a raw markdown token leaking would show up as literal text
    expect(html).not.toContain('## ')
  })
})
