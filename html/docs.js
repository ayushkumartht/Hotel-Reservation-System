/* =========================================================
   Docs page helpers
   - colours SQL code (black and white style)
   - adds a "Copy" button to every SQL code block
   - highlights the current section in the sidebar
   ========================================================= */

(function () {
    'use strict';

    var KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'LIKE',
        'BETWEEN', 'ORDER', 'BY', 'GROUP', 'HAVING', 'ASC', 'DESC', 'AS', 'JOIN', 'LEFT', 'RIGHT',
        'INNER', 'ON', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
        'DATABASE', 'DROP', 'IF', 'EXISTS', 'USE', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
        'UNIQUE', 'CHECK', 'DEFAULT', 'VIEW', 'REPLACE', 'SHOW', 'TABLES', 'DISTINCT',
        'LIMIT', 'UNION', 'ALL', 'INT', 'VARCHAR', 'DECIMAL', 'DATE'];
    var FUNCTIONS = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DATEDIFF', 'CONCAT', 'MONTHNAME', 'MONTH'];

    var TOKEN = new RegExp(
        '(--[^\\n]*)' +                                   // 1. comment
        "|('(?:[^']|'')*')" +                             // 2. text in quotes
        '|\\b(' + FUNCTIONS.join('|') + ')(?=\\s*\\()' +  // 3. function
        '|\\b(' + KEYWORDS.join('|') + ')\\b' +           // 4. keyword
        '|\\b(\\d+(?:\\.\\d+)?)\\b',                      // 5. number
        'gi');

    function escapeHtml(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function highlight(code) {
        var out = '', last = 0, m;
        TOKEN.lastIndex = 0;
        while ((m = TOKEN.exec(code)) !== null) {
            out += escapeHtml(code.slice(last, m.index));
            var cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'f' : m[4] ? 'k' : 'n';
            out += '<span class="sql-' + cls + '">' + escapeHtml(m[0]) + '</span>';
            last = TOKEN.lastIndex;
        }
        return out + escapeHtml(code.slice(last));
    }

    function copyText(text, done) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(done, function () { oldCopy(text, done); });
        } else {
            oldCopy(text, done);
        }
    }

    function oldCopy(text, done) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
    }

    // colour the code + add a copy button (used again by er3d.js for the panel)
    function enhance(root) {
        var blocks = root.querySelectorAll('pre > code.sql');
        Array.prototype.forEach.call(blocks, function (code) {
            if (code.getAttribute('data-done')) return;
            code.setAttribute('data-done', '1');
            var text = code.textContent;
            code.innerHTML = highlight(text);

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'copy-btn';
            btn.textContent = 'Copy';
            btn.addEventListener('click', function () {
                copyText(text, function () {
                    btn.textContent = 'Copied!';
                    setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
                });
            });
            code.parentNode.appendChild(btn);
        });
    }

    window.DocsSQL = { highlight: highlight, enhance: enhance };
    enhance(document);

    // "Open all / Close all" button for the 26 queries
    var toggle = document.getElementById('toggle-queries');
    if (toggle) {
        toggle.addEventListener('click', function () {
            var all = document.querySelectorAll('#sql-queries details');
            var open = toggle.getAttribute('data-open') !== '1';
            Array.prototype.forEach.call(all, function (d) { d.open = open; });
            toggle.setAttribute('data-open', open ? '1' : '0');
            toggle.textContent = open ? 'Close all queries' : 'Open all queries';
        });
    }

    // search box: shows only the queries that contain the typed word
    var search = document.getElementById('query-search');
    if (search) {
        var boxes = document.querySelectorAll('#sql-queries details.q');
        var count = document.getElementById('query-count');
        search.addEventListener('input', function () {
            var word = search.value.trim().toLowerCase();
            var shown = 0;
            Array.prototype.forEach.call(boxes, function (d) {
                var match = !word || d.textContent.toLowerCase().indexOf(word) !== -1;
                d.style.display = match ? '' : 'none';
                if (match) shown++;
            });
            count.textContent = word ? shown + ' of ' + boxes.length + ' queries' : '';
        });
    }

    // every query box gets an id (q1, q2 ...), so a link like docs.html#q14 opens that query
    Array.prototype.forEach.call(document.querySelectorAll('details.q'), function (d) {
        var no = d.querySelector('.qno');
        if (no) d.id = no.textContent.trim().toLowerCase();
    });
    function openQueryFromLink() {
        var id = location.hash.slice(1).toLowerCase();
        if (!/^q\d+$/.test(id)) return;
        var box = document.getElementById(id);
        if (box) {
            box.open = true;
            box.scrollIntoView({ block: 'start' });
        }
    }
    openQueryFromLink();
    window.addEventListener('hashchange', openQueryFromLink);

    // highlight the section you are reading in the sidebar
    var links = document.querySelectorAll('.docs-sidebar a[href^="#"]');
    if (window.IntersectionObserver && links.length) {
        var bySection = {};
        Array.prototype.forEach.call(links, function (a) {
            bySection[a.getAttribute('href').slice(1)] = a;
        });
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                Array.prototype.forEach.call(links, function (a) { a.classList.remove('active'); });
                var a = bySection[en.target.id];
                if (a) a.classList.add('active');
            });
        }, { rootMargin: '-15% 0px -75% 0px' });
        Object.keys(bySection).forEach(function (id) {
            var sec = document.getElementById(id);
            if (sec) spy.observe(sec);
        });
    }
})();
