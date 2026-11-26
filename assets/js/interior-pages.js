(() => {
  'use strict';

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  // The Markdown citation remains the single source of truth. Unrecognized
  // citations stay intact instead of losing author, title or venue information.
  function parseCitation(text) {
    const normalized = text.replace(/\s+/g, ' ').trim();
    const match = normalized.match(/^(.*?)\s*(?:["“]|''|‘‘)(.*?)(?:["“”]|''|[‘’]{2})\s*[,]?\s*(.*)$/);
    if (!match) return { title: normalized, authors: '', venue: '', citation: '', year: '', doi: '' };
    const remainder = match[3];
    const doi = remainder.match(/10\.\d{4,9}\/[^\s)]+/i)?.[0].replace(/[.,;]+$/, '') || '';
    const years = remainder.match(/\b(?:19|20)\d{2}\b/g);
    const year = years?.[0] || '';
    const venueEnd = remainder.search(/,\s*(?:Vol\.?|No\.?|Issue|pp?\.|\d{4}\b|Under review|Accepted|In preparation)|\s*\(doi\s*:/i);
    const venue = venueEnd < 0 ? remainder : remainder.slice(0, venueEnd);
    const citation = (venueEnd < 0 ? '' : remainder.slice(venueEnd))
      .replace(/\s*\(doi\s*:[^)]*\)\.?/gi, '')
      .replace(year ? new RegExp(`(^|,\\s*)${year}\\s*,?\\s*`) : /$^/, '$1')
      .replace(/^[,\s]+|[,\s]+$/g, '');
    return {
      title: match[2].replace(/[,\s]+$/, ''),
      authors: match[1].replace(/[,\s]+$/, ''),
      venue, citation, year, doi
    };
  }

  function pagination(container, current, total, onChange) {
    container.replaceChildren();
    container.hidden = total <= 1;
    if (total <= 1) return;
    const button = (label, page, disabled, accessibleLabel) => {
      const control = element('button', '', label);
      control.type = 'button';
      control.disabled = disabled;
      control.dataset.page = page;
      control.setAttribute('aria-label', accessibleLabel);
      if (page === current && label !== '‹' && label !== '›') control.setAttribute('aria-current', 'page');
      control.addEventListener('click', () => {
        onChange(page);
        // Rebuilding controls must not drop keyboard focus back to the document.
        container.querySelector(`[data-page="${page}"][aria-current]`)?.focus({ preventScroll: true });
      });
      container.append(control);
    };
    button('‹', current - 1, current === 1, 'Previous page');
    let previous = 0;
    for (let page = 1; page <= total; page++) {
      if (page !== 1 && page !== total && Math.abs(page - current) > 1) continue;
      if (previous && page - previous > 1) container.append(element('span', 'pagination-gap', '…'));
      button(String(page), page, false, `Page ${page}`);
      previous = page;
    }
    button('›', current + 1, current === total, 'Next page');
  }

  const publications = document.querySelector('[data-publications]');
  if (publications) {
    const source = publications.querySelector('.publication-source');
    const search = publications.querySelector('[data-paper-search]');
    const category = publications.querySelector('[data-paper-category]');
    const count = publications.querySelector('[data-paper-count]');
    const pager = publications.querySelector('[data-paper-pagination]');
    const groups = [];
    const papers = [];
    let group = null;
    let currentPage = 1;
    const perPage = 5;
    for (const child of Array.from(source?.children || [])) {
      if (child.tagName === 'H3') {
        group = { label: child.textContent.trim(), id: String(groups.length), count: 0 };
        groups.push(group);
      }
      if (child.tagName !== 'OL' || !group) continue;
      for (const row of Array.from(child.children)) {
        const original = row.textContent.replace(/\s+/g, ' ').trim();
        const data = parseCitation(original);
        group.count++;
        const main = element('div', 'paper-main');
        main.append(element('h3', '', data.title));
        if (data.authors) main.append(element('p', 'paper-authors', data.authors));
        const venue = element('div', 'paper-venue');
        if (data.venue) venue.append(element('p', 'paper-venue-name', data.venue));
        if (data.citation) venue.append(element('p', 'paper-citation', data.citation));
        const meta = element('div', 'paper-meta');
        if (data.year) meta.append(element('span', 'paper-year', data.year));
        if (data.doi) {
          const link = element('a', '', 'DOI ↗');
          link.href = `https://doi.org/${data.doi}`;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.setAttribute('aria-label', `DOI for ${data.title}`);
          meta.append(link);
        }
        // Preserve any existing non-DOI reference links in the Markdown source.
        for (const link of Array.from(row.querySelectorAll('a[href]'))) {
          if (!link.href.includes('doi.org')) meta.append(link.cloneNode(true));
        }
        const number = element('span', 'paper-number', String(group.count).padStart(2, '0'));
        number.setAttribute('aria-hidden', 'true');
        row.replaceChildren(number, main, venue, meta);
        papers.push({ row, group: group.id, search: original.toLocaleLowerCase() });
      }
    }
    if (papers.length) {
      const all = element('option', '', 'All publications');
      all.value = 'all';
      category.append(all);
      for (const item of groups) {
        const option = element('option', '', item.label);
        option.value = item.id;
        category.append(option);
      }
      category.value = groups[0].id;
      source.classList.add('is-enhanced');
      publications.querySelector('.publication-search').hidden = false;
      publications.querySelector('.publication-filter').hidden = false;

      const render = () => {
        const query = search.value.trim().toLocaleLowerCase();
        const matching = papers.filter(paper => (category.value === 'all' || category.value === paper.group) && paper.search.includes(query));
        const total = Math.max(1, Math.ceil(matching.length / perPage));
        currentPage = Math.min(currentPage, total);
        const visible = new Set(matching.slice((currentPage - 1) * perPage, currentPage * perPage));
        papers.forEach(paper => { paper.row.hidden = !visible.has(paper); });
        source.querySelectorAll(':scope > ol').forEach(list => { list.hidden = !Array.from(list.children).some(row => !row.hidden); });
        count.textContent = matching.length ? `${(currentPage - 1) * perPage + 1}–${Math.min(currentPage * perPage, matching.length)} of ${matching.length}` : '0 results';
        publications.querySelector('.publication-empty').hidden = matching.length > 0;
        pagination(pager, currentPage, total, page => {
          currentPage = page;
          render();
          publications.querySelector('.publication-toolbar').scrollIntoView({ block: 'start' });
        });
        const isOther = groups.find(item => item.id === category.value)?.label.match(/arxiv|preparation/i);
        const tabs = publications.querySelectorAll('.publication-tabs a');
        const conference = /\/Conference\/?$/.test(location.pathname);
        tabs.forEach(tab => tab.removeAttribute('aria-current'));
        tabs[isOther ? 2 : conference ? 1 : 0].setAttribute('aria-current', 'page');
        publications.querySelector('.publication-toolbar h2').textContent = isOther ? 'Other Papers' : conference ? 'Conference Papers' : 'Journals';
      };
      search.addEventListener('input', () => { currentPage = 1; render(); });
      category.addEventListener('change', () => { currentPage = 1; render(); });
      const applyHash = () => {
        if (location.hash === '#other-papers') {
          const others = groups.find(item => /arxiv|preparation/i.test(item.label));
          if (others) category.value = others.id;
          currentPage = 1;
        }
        render();
      };
      window.addEventListener('hashchange', applyHash);
      applyHash();
    }
  }

  const noticeList = document.querySelector('[data-notice-list]');
  if (noticeList) {
    const rows = Array.from(noticeList.querySelectorAll('[data-notice-item]'));
    const pager = document.querySelector('[data-notice-pagination]');
    const perPage = 10;
    const render = page => {
      rows.forEach((row, index) => { row.hidden = index < (page - 1) * perPage || index >= page * perPage; });
      pagination(pager, page, Math.ceil(rows.length / perPage), next => {
        render(next);
        noticeList.scrollIntoView({ block: 'start' });
      });
    };
    render(1);
  }
})();
