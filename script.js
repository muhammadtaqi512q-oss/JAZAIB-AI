// Frontend script
console.log("Website loaded successfully!");

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Track button clicks (sends to backend /api/track)
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'click', href: link.href, time: Date.now() })
    }).catch(() => {});
  });
});
