// ==UserScript==
// @name        Google Calendar cleanup
// @namespace   https://github.com/jbboynton/firefox-user-scripts
// @match       https://calendar.google.com/*
// @grant       none
// @run-at      document-idle
// @version     1.5
// @description Hide Calendar clutter: upsells, unused panels and calendars.
// ==/UserScript==

(() => {
  'use strict';

  // Google's class names are obfuscated and change, so elements are
  // found by their visible label or aria-label wherever possible. Hiding
  // rather than removing keeps Calendar's own code from tripping over
  // missing nodes.
  const BOOKING = { label: 'Booking pages', selector: 'div.EKq2Ub' };
  const CALENDARS = new Set(['Birthdays', 'Tasks']);
  const CREATE_ITEMS = new Set(['Task', 'Appointment schedule']);

  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const UPGRADE = '[aria-label="Upgrade"]';
  const NOT_UPGRADE = ['a', 'button', 'input', '[role="button"]']
    .map((control) => `${control}:not(${UPGRADE})`)
    .join(', ');

  // Each returns the elements to hide.
  const CLUTTER = [
    // "Meet with…" people search in the sidebar.
    () => $$('input[aria-label="Search for people to meet"]')
      .map((input) => input.closest('[role="search"]')),
    // Upgrade buttons (the header has two, which share a wrapper), with
    // every wrapper that holds no other control: the outer ones keep
    // their width and leave a gap in the header.
    () => $$(`button${UPGRADE}`).map((button) => {
      let box = button;
      let up = box.parentElement;
      while (up && !up.querySelector(NOT_UPGRADE)) {
        box = up;
        up = up.parentElement;
      }
      return box;
    }),
    // Calendar/Tasks view toggle: the box holding both switch buttons.
    () => $$('[aria-label="Switch to Tasks"]').map((button) => {
      let box = button.parentElement;
      while (box && !box.querySelector('[aria-label="Switch to Calendar"]')) {
        box = box.parentElement;
      }
      return box;
    }),
    // Arrow that opens the side panel.
    () => $$('[role="button"][aria-label="Show side panel"]'),
    // Task and Appointment schedule in the Create menu, which is told
    // apart from other menus by its "Out of office" item.
    () => $$('[role="menu"]')
      .filter((menu) => hasLabel(menu, (text) => text === 'Out of office'))
      .flatMap((menu) => [...menu.querySelectorAll('[role="menuitem"]')])
      .filter((item) => hasLabel(item, (text) => CREATE_ITEMS.has(text))),
  ];

  // The calendar lists are virtual: each row is absolutely positioned
  // with translateY inside a container of fixed height, and only rows
  // near the viewport exist. So a hidden row leaves a gap that ordinary
  // layout cannot close. Instead, each later row is pulled up by the
  // height of the hidden rows above it, and the container's bottom
  // margin absorbs the rest. Hidden rows are remembered by their offset,
  // since the list renders and recycles rows as it scrolls.
  const LIST = 'div.DB71Ge';
  const hiddenByList = new WeakMap();

  const hasLabel = (root, test) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node; (node = walker.nextNode()); ) {
      if (test(node.data.trim())) return true;
    }
    return false;
  };

  const offsetOf = (row) => {
    const match = /translateY\((-?[\d.]+)px\)/.exec(row.style.transform);
    return match ? Number(match[1]) : null;
  };

  // Write only on change, so the observer does not loop on our edits.
  const setStyle = (el, prop, value) => {
    if (el.style.getPropertyValue(prop) === value) return;
    if (value) el.style.setProperty(prop, value, 'important');
    else el.style.removeProperty(prop);
  };

  const sweepList = (list) => {
    let hidden = hiddenByList.get(list);
    if (!hidden) hiddenByList.set(list, (hidden = new Map()));

    const rows = [...list.children];
    for (const row of rows) {
      const y = offsetOf(row);
      if (y === null) continue;
      if (hasLabel(row, (text) => CALENDARS.has(text))) {
        hidden.set(y, row.offsetHeight || parseFloat(row.style.height));
      } else {
        hidden.delete(y);
      }
    }

    let total = 0;
    for (const height of hidden.values()) total += height;

    for (const row of rows) {
      const y = offsetOf(row);
      if (y !== null && hidden.has(y)) {
        setStyle(row, 'display', 'none');
        setStyle(row, 'margin-top', '');
        continue;
      }
      setStyle(row, 'display', '');
      let shift = 0;
      for (const [hy, height] of hidden) if (hy < y) shift += height;
      setStyle(row, 'margin-top', shift ? `-${shift}px` : '');
    }
    setStyle(list, 'margin-bottom', total ? `-${total}px` : '');
  };

  const sweep = () => {
    for (const box of $$(BOOKING.selector)) {
      if (hasLabel(box, (text) => text === BOOKING.label)) {
        setStyle(box, 'display', 'none');
      }
    }
    for (const find of CLUTTER) {
      for (const el of find()) if (el) setStyle(el, 'display', 'none');
    }
    $$(LIST).forEach(sweepList);
  };

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      sweep();
    });
  };

  sweep();
  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style'],
  });
})();
