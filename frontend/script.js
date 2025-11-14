const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    loadShows();
});

async function loadShows() {
    const loadingDiv = document.getElementById('loading');
    const showsList = document.getElementById('shows-list');
    const errorDiv = document.getElementById('error-message');

    try {
        loadingDiv.style.display = 'block';
        const response = await fetch(`${API_URL}/shows`);
        
        if (!response.ok) {
            throw new Error('Failed to load shows');
        }

        const shows = await response.json();
        loadingDiv.style.display = 'none';

        if (shows.length === 0) {
            showsList.innerHTML = '<p>No shows available at the moment. Check the Admin panel to add shows!</p>';
            return;
        }

        showsList.innerHTML = shows.map(show => `
            <div class="show-card">
                <h3>${show.title}</h3>
                <p><strong>📅 Date:</strong> ${new Date(show.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</p>
                <p><strong>🕐 Time:</strong> ${show.time}</p>
                <p><strong>📍 Venue:</strong> ${show.venue || 'Medallion Theatre'}</p>
                <p><strong>💰 Price:</strong> $${show.ticketPrice}</p>
                <p><strong>🎫 Available Seats:</strong> ${show.availableSeats} / ${show.totalSeats}</p>
                ${show.description ? `<p style="margin-top: 1rem; color: #666;">${show.description}</p>` : ''}
                <a href="booking.html" class="btn btn-primary" style="display: inline-block; margin-top: 1rem; text-decoration: none;">
                    Book Now
                </a>
            </div>
        `).join('');

    } catch (error) {
        loadingDiv.style.display = 'none';
        errorDiv.textContent = `Error: ${error.message}. Please make sure the server is running on http://localhost:5000`;
        errorDiv.style.display = 'block';
        console.error('Error loading shows:', error);
    }
}

async function searchBooking() {
    const searchInput = document.getElementById('search-input').value.trim();
    const resultsDiv = document.getElementById('search-results');

    if (!searchInput) {
        resultsDiv.innerHTML = '<p style="color: #e74c3c;">Please enter a customer name or email.</p>';
        return;
    }

    try {
        resultsDiv.innerHTML = '<p>Searching...</p>';

        const customerResponse = await fetch(`${API_URL}/customers`);
        const customers = await customerResponse.json();
        
        const matchedCustomers = customers.filter(customer => 
            customer.firstName.toLowerCase().includes(searchInput.toLowerCase()) ||
            customer.lastName.toLowerCase().includes(searchInput.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchInput.toLowerCase())
        );

        if (matchedCustomers.length === 0) {
            resultsDiv.innerHTML = '<p>No bookings found with that name or email.</p>';
            return;
        }

        const ticketsResponse = await fetch(`${API_URL}/tickets`);
        const allTickets = await ticketsResponse.json();

        const customerTickets = allTickets.filter(ticket => 
            matchedCustomers.some(customer => customer._id === ticket.customer._id)
        );

        if (customerTickets.length === 0) {
            resultsDiv.innerHTML = '<p>No bookings found for this customer.</p>';
            return;
        }

        resultsDiv.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: #667eea;">Found ${customerTickets.length} booking(s)</h3>
            ${customerTickets.map(ticket => `
                <div class="show-card" style="margin-bottom: 1rem;">
                    <h4>Booking #${ticket._id.slice(-8).toUpperCase()}</h4>
                    <p><strong>Show:</strong> ${ticket.show.title}</p>
                    <p><strong>Date:</strong> ${new Date(ticket.show.date).toLocaleDateString()} at ${ticket.show.time}</p>
                    <p><strong>Customer:</strong> ${ticket.customer.firstName} ${ticket.customer.lastName}</p>
                    <p><strong>Email:</strong> ${ticket.customer.email}</p>
                    <p><strong>Phone:</strong> ${ticket.customer.phone}</p>
                    <p><strong>Seats:</strong> ${ticket.seatNumbers.join(', ')}</p>
                    <p><strong>Number of Tickets:</strong> ${ticket.numberOfTickets}</p>
                    <p><strong>Total Price:</strong> $${ticket.totalPrice}</p>
                    <p><strong>Status:</strong> <span style="color: ${ticket.status === 'confirmed' ? '#2ecc71' : '#f39c12'}; font-weight: bold;">${ticket.status.toUpperCase()}</span></p>
                    <p><strong>Booking Date:</strong> ${new Date(ticket.bookingDate).toLocaleString()}</p>
                </div>
            `).join('')}
        `;

    } catch (error) {
        resultsDiv.innerHTML = `<p style="color: #e74c3c;">Error: ${error.message}</p>`;
        console.error('Error searching bookings:', error);
    }
}

const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBooking();
        }
    });
}