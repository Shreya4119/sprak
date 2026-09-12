/* Unit tests for the pure logic that produces every number a learner sees.
   This layer has never been tested. Start here, then widen. */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SOURCES } from '../vite.config.js';

let app;
beforeAll(() => {
  /* Run the app's scripts in a jsdom-free sandbox with the DOM bits stubbed,
     then hand back the globals we want to assert on. */
  const src = SOURCES.map(f => readFileSync(resolve('src', f), 'utf8')).join('\n');
  const shim = `
    const el = () => ({ dataset:{}, style:{}, innerHTML:'', textContent:'', value:'',
      classList:{ add(){}, remove(){}, toggle(){}, contains:()=>false },
      appendChild(){}, remove(){}, addEventListener(){}, focus(){},
      querySelector: () => null, querySelectorAll: () => [], closest: () => null,
      scrollIntoView(){}, getBoundingClientRect: () => ({width:390,height:844}) });
    const document = { getElementById: el, querySelector: el, querySelectorAll: () => [],
      createElement: el, addEventListener(){}, body: el() };
    const window = { addEventListener(){}, scrollTo(){}, matchMedia: () => ({matches:false}) };
    const localStorage = { getItem: () => null, setItem(){}, removeItem(){} };
    const speechSynthesis = { speak(){}, cancel(){}, getVoices: () => [] };
    class SpeechSynthesisUtterance { constructor(t){ this.text = t; } }
    const setTimeout = () => 0;
  `;
  const expose = `; return { note, a1Readiness, unlocked, unitDone, stage0Done,
      speechMatch, levDist, wordResult, wstate, S, UNITS, VOCAB, STAGES, milestoneReqs };`;
  app = new Function(shim + src + expose)();
});

describe('grading', () => {
  it('maps percentages to German Noten 1-6', () => {
    expect(app.note(100).n).toBe(1);
    expect(app.note(50).n).toBeGreaterThanOrEqual(4);   // 50% is 'ausreichend'
    expect(app.note(0).n).toBe(6);
  });
  it('never returns a Note outside 1-6', () => {
    for (let p = 0; p <= 100; p++) {
      const n = app.note(p).n;
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(6);
    }
  });
});

describe('content integrity', () => {
  it('every unit vocab id has a matching W() entry', () => {
    const missing = [];
    app.UNITS.forEach(u => (u.vocab || []).forEach(id => { if (!app.VOCAB[id]) missing.push(`${u.id}:${id}`); }));
    expect(missing).toEqual([]);
  });
  it('every teach move names words that exist', () => {
    const missing = [];
    app.UNITS.forEach(u => (u.teach || []).forEach(m => (m.words || []).forEach(id => {
      if (!app.VOCAB[id]) missing.push(`${u.id}:${id}`);
    })));
    expect(missing).toEqual([]);
  });
  it('every unit declares a concept', () => {
    expect(app.UNITS.filter(u => !u.concept).map(u => u.id)).toEqual([]);
  });
  it('Klara never reads the board aloud', () => {
    const strip = s => String(s || '').replace(/<[^>]+>/g, '').trim();
    const bad = [];
    app.UNITS.forEach(u => (u.teach || []).forEach((m, i) => {
      const written = strip([m.board, m.note, m.after, m.concept].filter(Boolean).join(' '));
      if (written && m.say && written === strip(m.say)) bad.push(`${u.id}[${i}]`);
    }));
    expect(bad).toEqual([]);
  });
  it('no em dashes or decorative emoji in learner-facing copy', () => {
    const text = JSON.stringify(app.UNITS) + JSON.stringify(app.STAGES);
    expect(text).not.toMatch(/[—–]/);
    expect(text).not.toMatch(/[😊👋🎉💪👀🥨👇]/u);
  });
});

describe('progression', () => {
  it('stage 0 is always open, planned units never are', () => {
    app.UNITS.filter(u => u.stage === 0 && !u.planned).forEach(u => expect(app.unlocked(u)).toBe(true));
    app.UNITS.filter(u => u.planned).forEach(u => expect(app.unlocked(u)).toBe(false));
  });
});

describe('speech matching', () => {
  it('accepts an exact match and rejects an unrelated utterance', () => {
    expect(app.speechMatch('Guten Morgen', 'Guten Morgen')).toBe(true);
    expect(app.speechMatch('Pizza', 'Guten Morgen')).toBe(false);
  });
  it('does not accept a short utterance for a long line', () => {
    expect(app.speechMatch('Hallo', 'Ich komme aus Indien und wohne in Berlin')).toBe(false);
  });
});
