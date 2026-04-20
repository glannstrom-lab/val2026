/**
 * Val 2026 — Shared Constants
 * Centralized constants used across multiple tools
 */

(function() {
  'use strict';

  // Party colors (official party colors)
  window.PARTY_COLORS = {
    V: '#AF0000',
    S: '#E8112D',
    MP: '#83CF39',
    C: '#009933',
    L: '#006AB3',
    KD: '#1F3C81',
    M: '#1B49DD',
    SD: '#DDDD00'
  };

  // Party full names
  window.PARTY_NAMES = {
    V: 'Vänsterpartiet',
    S: 'Socialdemokraterna',
    MP: 'Miljöpartiet',
    C: 'Centerpartiet',
    L: 'Liberalerna',
    KD: 'Kristdemokraterna',
    M: 'Moderaterna',
    SD: 'Sverigedemokraterna'
  };

  // Text colors for readability on party backgrounds
  window.PARTY_TEXT_COLORS = {
    V: '#ffffff',
    S: '#ffffff',
    MP: '#000000',
    C: '#ffffff',
    L: '#ffffff',
    KD: '#ffffff',
    M: '#ffffff',
    SD: '#000000'
  };

  // Party abbreviations (short form)
  window.PARTY_IDS = ['V', 'S', 'MP', 'C', 'L', 'KD', 'M', 'SD'];

  // Riksdag constants
  window.RIKSDAG_TOTAL_SEATS = 349;
  window.RIKSDAG_MAJORITY = 175;
  window.RIKSDAG_THRESHOLD = 4; // 4% threshold

})();
