import { test } from 'node:test';
import assert from 'node:assert/strict';
import { colorProblem, generateSlug, normalizeUrl, parseUserAgent, visitorHash } from '../lib/utils.js';

test('normalizeUrl adds https and keeps valid links', () => {
  assert.equal(normalizeUrl('example.com/menu'), 'https://example.com/menu');
  assert.equal(normalizeUrl('  http://shop.example.com?a=1 '), 'http://shop.example.com/?a=1');
});

test('normalizeUrl rejects unsafe or broken links', () => {
  assert.equal(normalizeUrl('javascript:alert(1)'), null);
  assert.equal(normalizeUrl('data:text/html,hi'), null);
  assert.equal(normalizeUrl('ftp://example.com'), null);
  assert.equal(normalizeUrl('not a url'), null);
  assert.equal(normalizeUrl(''), null);
  assert.equal(normalizeUrl('x'.repeat(3000) + '.com'), null);
});

test('generateSlug makes readable unique-looking slugs', () => {
  const slug = generateSlug();
  assert.match(slug, /^[23456789a-km-zA-HJ-NP-Z]{7}$/);
  const many = new Set(Array.from({ length: 1000 }, () => generateSlug()));
  assert.equal(many.size, 1000);
});

test('colorProblem blocks codes phones cannot scan', () => {
  assert.equal(colorProblem('#000000', '#ffffff'), null);
  assert.equal(colorProblem('#1e3a8a', '#ffffff'), null);
  assert.match(colorProblem('#ffffff', '#000000'), /darker/);
  assert.match(colorProblem('#cccccc', '#ffffff'), /similar/);
  assert.match(colorProblem('red', '#ffffff'), /hex/);
});

test('parseUserAgent detects device, os and bots', () => {
  const iphone = parseUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1');
  assert.deepEqual(iphone, { device: 'mobile', os: 'iOS', browser: 'Safari', isBot: false });

  const android = parseUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36');
  assert.deepEqual(android, { device: 'mobile', os: 'Android', browser: 'Chrome', isBot: false });

  const tablet = parseUserAgent('Mozilla/5.0 (Linux; Android 13; SM-X200) AppleWebKit/537.36 Chrome/130.0 Safari/537.36');
  assert.equal(tablet.device, 'tablet');

  assert.equal(parseUserAgent('WhatsApp/2.23.20 A').isBot, true);
  assert.equal(parseUserAgent('Googlebot/2.1').isBot, true);
});

test('visitorHash is stable per day and hides the IP', () => {
  const a = visitorHash('1.2.3.4', 'ua', '2026-11-08');
  assert.equal(a, visitorHash('1.2.3.4', 'ua', '2026-11-08'));
  assert.notEqual(a, visitorHash('1.2.3.4', 'ua', '2026-11-09'));
  assert.ok(!a.includes('1.2.3.4'));
});
