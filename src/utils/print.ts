/** Print only the element with the `receipt-print` class (see print rules in index.css). */
export function printReceipt() {
  const body = document.body;
  const cleanup = () => {
    body.classList.remove('print-receipt-mode');
    window.removeEventListener('afterprint', cleanup);
  };
  body.classList.add('print-receipt-mode');
  window.addEventListener('afterprint', cleanup);
  try {
    window.print();
  } catch {
    cleanup();
  }
}