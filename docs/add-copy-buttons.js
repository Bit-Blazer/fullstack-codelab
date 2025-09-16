// insert-copy-script.js
// Usage: node insert-copy-script.js

const fs = require('fs');
const FILE = 'index.html'; // Change if your codelab file has a different name

if (!fs.existsSync(FILE)) {
  console.error(`❌ Could not find ${FILE}`);
  process.exit(1);
}

let html = fs.readFileSync(FILE, 'utf8');

// Prevent double-injection
if (html.includes('<!-- copy-button-script-injected -->')) {
  console.log('ℹ️  Copy button script already injected. Skipping.');
  process.exit(0);
}

const scriptBlock = `
<!-- copy-button-script-injected -->
<script>
(function () {
  function addCopyButtons() {
    document.querySelectorAll('pre').forEach(code => {
      if (code.dataset.copyButtonAdded) return;
      code.dataset.copyButtonAdded = "true";

      // Make code element position relative (but don't touch font/style)
      code.style.position = code.style.position || 'relative';

      const btn = document.createElement('button');
      btn.textContent = '📋';
      btn.style.position = 'absolute';
      btn.style.top = '6px';
      btn.style.right = '6px';
      btn.style.fontSize = '0.8rem';
      btn.style.padding = '2px 6px';
      btn.style.cursor = 'pointer';
      btn.style.background = 'rgba(255,255,255,0.85)';
      btn.style.border = '1px solid #ccc';
      btn.style.borderRadius = '4px';
      btn.style.zIndex = 10;

      btn.addEventListener('click', async () => {
        console.log('copying code...');
        try {
          // remove 📋 emoji after copying
          await navigator.clipboard.writeText(code.innerText.replace(/📋/g, '').trim());
          btn.textContent = '✅';
          setTimeout(() => (btn.textContent = '📋'), 1500);
        } catch (e) {
          const ta = document.createElement('textarea');
          ta.value = code.innerText;
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          btn.textContent = '✅';
          setTimeout(() => (btn.textContent = '📋'), 1500);
        }
      });

      code.appendChild(btn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCopyButtons);
  } else {
    addCopyButtons();
  }
})();
</script>`;

// Insert before </body> (case-insensitive)
if (html.match(/<\/body>/i)) {
  html = html.replace(/<\/body>/i, scriptBlock + '\n</body>');
  fs.writeFileSync(FILE, html, 'utf8');
  console.log('✅ Copy button script injected into', FILE);
} else {
  console.error('❌ No </body> tag found. Could not inject script.');
}
