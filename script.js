let reservations = [];
let nextId = 1;

const availableRooms = [
  '101', '102', '103', '104', '105',
  '201', '202', '203', '204', '205',
  '301', '302', '303', '304', '305',
  '401', '402', '403', '404', '405'
];

document.addEventListener('DOMContentLoaded', function () {
  initializeRoomOptions();
  loadSampleData();
  updateDashboard();
  displayReservations();
  setupFormValidation();
  document.getElementById('searchReservation').addEventListener('input', filterReservations);

  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  document.getElementById('startDate').value = lastMonth.toISOString().split('T')[0];
  document.getElementById('endDate').value = today.toISOString().split('T')[0];
});

function showSection(sectionId, event) {
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  document.getElementById(sectionId).classList.add('active');
  event.target.classList.add('active');

  if (sectionId === 'dashboard') {
    updateDashboard();
  }
}

function initializeRoomOptions() {
  const selects = ['roomNumber', 'editRoomNumber'];
  selects.forEach(selectId => {
    const select = document.getElementById(selectId);
    availableRooms.forEach(room => {
      const option = document.createElement('option');
      option.value = room;
      option.textContent = `Room ${room}`;
      select.appendChild(option);
    });
  });
}

function loadSampleData() {
  const sampleReservations = [
    {
      id: nextId++,
      customerName: 'kanishka',
      roomNumber: '101',
      checkInDate: '2025-05-20',
      checkOutDate: '2025-05-25',
      totalAmount: 750.00
    },
    {
      id: nextId++,
      customerName: 'anu',
      roomNumber: '205',
      checkInDate: '2025-05-22',
      checkOutDate: '2025-05-28',
      totalAmount: 980.00
    },
    {
      id: nextId++,
      customerName: 'viji',
      roomNumber: '301',
      checkInDate: '2025-05-15',
      checkOutDate: '2025-05-20',
      totalAmount: 650.00
    }
  ];
  reservations = sampleReservations;
}

function setupFormValidation() {
  document.getElementById('addReservationForm').addEventListener('submit', handleAddReservation);
  document.getElementById('editReservationForm').addEventListener('submit', handleEditReservation);
  document.getElementById('checkInDate').addEventListener('change', validateDates);
  document.getElementById('checkOutDate').addEventListener('change', validateDates);
  document.getElementById('editCheckInDate').addEventListener('change', validateEditDates);
  document.getElementById('editCheckOutDate').addEventListener('change', validateEditDates);
}

function validateField(fieldId, value, validationType) {
  const errorElement = document.getElementById(fieldId + 'Error');
  let isValid = true;
  let errorMessage = '';

  switch (validationType) {
    case 'required':
      if (!value.trim()) {
        isValid = false;
        errorMessage = 'This field is required';
      }
      break;
    case 'name':
      if (!value.trim()) {
        isValid = false;
        errorMessage = 'Customer name is required';
      } else if (value.trim().length < 2) {
        isValid = false;
        errorMessage = 'Name must be at least 2 characters';
      } else if (!/^[a-zA-Z\s]+$/.test(value)) {
        isValid = false;
        errorMessage = 'Name can only contain letters and spaces';
      }
      break;
    case 'amount':
      if (!value || parseFloat(value) <= 0) {
        isValid = false;
        errorMessage = 'Amount must be greater than 0';
      }
      break;
  }

  if (errorElement) {
    errorElement.textContent = errorMessage;
    errorElement.style.display = isValid ? 'none' : 'block';
  }

  return isValid;
}

function validateDates() {
  const checkIn = document.getElementById('checkInDate').value;
  const checkOut = document.getElementById('checkOutDate').value;

  if (checkIn && checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      showError('checkInDate', 'Check-in date cannot be in the past');
      return false;
    }

    if (checkOutDate <= checkInDate) {
      showError('checkOutDate', 'Check-out date must be after check-in date');
      return false;
    }

    clearError('checkInDate');
    clearError('checkOutDate');
    return true;
  }

  return true;
}

function validateEditDates() {
  const checkIn = document.getElementById('editCheckInDate').value;
  const checkOut = document.getElementById('editCheckOutDate').value;

  if (checkIn && checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      alert('Check-out date must be after check-in date');
      return false;
    }
  }

  return true;
}

function showError(fieldId, message) {
  const errorElement = document.getElementById(fieldId + 'Error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

function clearError(fieldId) {
  const errorElement = document.getElementById(fieldId + 'Error');
  if (errorElement) {
    errorElement.style.display = 'none';
  }
}

function handleAddReservation(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const customerName = formData.get('customerName');
  const roomNumber = formData.get('roomNumber');
  const checkInDate = formData.get('checkInDate');
  const checkOutDate = formData.get('checkOutDate');
  const totalAmount = parseFloat(formData.get('totalAmount'));

  let isValid = true;
  isValid &= validateField('customerName', customerName, 'name');
  isValid &= validateField('roomNumber', roomNumber, 'required');
  isValid &= validateField('totalAmount', totalAmount, 'amount');
  isValid &= validateDates();

  if (isRoomBooked(roomNumber, checkInDate, checkOutDate)) {
    showError('roomNumber', 'Room is not available for selected dates');
    isValid = false;
  }

  if (isValid) {
    const reservation = {
      id: nextId++,
      customerName: customerName.trim(),
      roomNumber,
      checkInDate,
      checkOutDate,
      totalAmount
    };

    reservations.push(reservation);

    const successMsg = document.getElementById('addSuccessMessage');
    successMsg.textContent = `Reservation added successfully! Reservation ID: ${reservation.id}`;
    successMsg.style.display = 'block';

    e.target.reset();
    updateDashboard();
    displayReservations();

    setTimeout(() => {
      successMsg.style.display = 'none';
    }, 5000);
  }
}

function isRoomBooked(roomNumber, checkInDate, checkOutDate, excludeId = null) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  return reservations.some(reservation => {
    if (excludeId && reservation.id === excludeId) return false;
    if (reservation.roomNumber === roomNumber) {
      const resCheckIn = new Date(reservation.checkInDate);
      const resCheckOut = new Date(reservation.checkOutDate);
      return checkIn < resCheckOut && checkOut > resCheckIn;
    }
    return false;
  });
}

function updateDashboard() {
  const totalReservations = reservations.length;
  const today = new Date();
  const activeReservations = reservations.filter(r => {
    const checkIn = new Date(r.checkInDate);
    const checkOut = new Date(r.checkOutDate);
    return today >= checkIn && today <= checkOut;
  }).length;

  const totalRevenue = reservations.reduce((sum, r) => sum + r.totalAmount, 0);
  const occupancyRate = Math.round((activeReservations / availableRooms.length) * 100);

  document.getElementById('totalReservations').textContent = totalReservations;
  document.getElementById('activeReservations').textContent = activeReservations;
  document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
  document.getElementById('occupancyRate').textContent = `${occupancyRate}%`;

  const recentReservations = reservations.slice(-5).reverse();
  const tbody = document.getElementById('recentReservationsBody');
  tbody.innerHTML = '';
  recentReservations.forEach(reservation => {
    const row = createReservationRow(reservation, false);
    tbody.appendChild(row);
  });
}

function displayReservations() {
  const tbody = document.getElementById('reservationsBody');
  tbody.innerHTML = '';
  reservations.forEach(reservation => {
    const row = createReservationRow(reservation, true);
    tbody.appendChild(row);
  });
}

function createReservationRow(reservation, includeActions = false) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${reservation.id}</td>
    <td>${reservation.customerName}</td>
    <td>${reservation.roomNumber}</td>
    <td>${formatDate(reservation.checkInDate)}</td>
    <td>${formatDate(reservation.checkOutDate)}</td>
    <td>${reservation.totalAmount.toFixed(2)}</td>
    ${includeActions ? `
    <td>
      <button onclick="editReservation(${reservation.id})" class="btn btn-primary">Edit</button>
      <button onclick="deleteReservation(${reservation.id})" class="btn btn-danger">Delete</button>
    </td>` : ``}
  `;
  return row;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function filterReservations() {
  const searchTerm = document.getElementById('searchReservation').value.toLowerCase();
  const filteredReservations = reservations.filter(reservation =>
    reservation.customerName.toLowerCase().includes(searchTerm) ||
    reservation.roomNumber.includes(searchTerm) ||
    reservation.id.toString().includes(searchTerm)
  );

  const tbody = document.getElementById('reservationsBody');
  tbody.innerHTML = '';
  filteredReservations.forEach(reservation => {
    const row = createReservationRow(reservation, true);
    tbody.appendChild(row);
  });
}

function editReservation(id) {
  const reservation = reservations.find(r => r.id === id);
  if (!reservation) return;

  document.getElementById('editReservationId').value = reservation.id;
  document.getElementById('editCustomerName').value = reservation.customerName;
  document.getElementById('editRoomNumber').value = reservation.roomNumber;
  document.getElementById('editCheckInDate').value = reservation.checkInDate;
  document.getElementById('editCheckOutDate').value = reservation.checkOutDate;
  document.getElementById('editTotalAmount').value = reservation.totalAmount;
  document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

document.getElementById('editModal').addEventListener('click', function (e) {
  if (e.target === this) {
    closeEditModal();
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeEditModal();
  }
});
