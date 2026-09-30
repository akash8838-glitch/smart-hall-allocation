const container = document.getElementById('requests');

function loadRequests() {
  fetch('/api/bookings?status=pending')
    .then(res => res.json())
    .then(list => {
      container.innerHTML = '';
      list.forEach(b => {
        const div = document.createElement('div');
        div.innerHTML = `
          <p>Hall: ${b.hallId}</p>
          <p>Date: ${b.date}</p>
          <p>Time: ${b.startTime} - ${b.endTime}</p>
          <p>By: ${b.userId}</p>
        `;
        const appBtn = document.createElement('button');
        appBtn.textContent = 'Approve';
        appBtn.onclick = () => updateStatus(b.id, 'approve');

        const rejBtn = document.createElement('button');
        rejBtn.textContent = 'Reject';
        rejBtn.onclick = () => updateStatus(b.id, 'reject');

        div.append(appBtn, rejBtn);
        container.append(div);
      });
    });
}

function updateStatus(id, action) {
  fetch(`/api/bookings/${id}/${action}`, { method: 'PUT' })
    .then(() => loadRequests());
}

// initial load
loadRequests();