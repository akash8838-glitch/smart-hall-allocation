const userId = 'staff1'; // Replace with actual login logic

// Load halls
fetch('/api/halls')
  .then(res => res.json())
  .then(halls => {
    const sel = document.getElementById('hallSelect');
    halls.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h.id;
      opt.textContent = h.name + ' (' + h.building + ')';
      sel.append(opt);
    });
  });

function requestBooking() {
  const hallId = document.getElementById('hallSelect').value;
  const date = document.getElementById('date').value;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;

  fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, hallId, date, startTime, endTime })
  })
    .then(res => {
      if (!res.ok) return res.json().then(e => Promise.reject(e.error));
      return res.json();
    })
    .then(b => alert('Booking submitted! ID: ' + b.id))
    .catch(err => alert(err));
}