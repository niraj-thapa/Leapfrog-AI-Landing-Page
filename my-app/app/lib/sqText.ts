/* Square's heading reveal ("split-text-clip-rise", see RevealController and the
 * html.sq-text rules in globals.css): every word of an element, inside any inline
 * markup, is wrapped in a clip (.sq-w) holding a mover (.sq-wi) with its index --i;
 * the element gets the word count --n and data-sq-split. Safe to call twice. */
export function splitWords(el: HTMLElement) {
  if (el.dataset.sqSplit !== undefined) return;
  let i = 0;
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        (child.textContent ?? '').split(/(\s+)/).forEach((t) => {
          if (!t) return;
          if (/^\s+$/.test(t)) return void frag.append(t);
          const clip = document.createElement('span');
          clip.className = 'sq-w';
          const word = document.createElement('span');
          word.className = 'sq-wi';
          word.style.setProperty('--i', String(i++));
          word.textContent = t;
          clip.append(word);
          frag.append(clip);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) walk(child);
    });
  };
  walk(el);
  el.style.setProperty('--n', String(i));
  el.dataset.sqSplit = '';
}

