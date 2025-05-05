import axios from 'axios';
import { showAlert } from './alert.js';
import Stripe from 'stripe';
// const bookBtn = document.getElementById('book-tour');
const stripe = new Stripe(
  'pk_test_51Qz3gLPb0qlt67XfYQh8ZL06aPqg8mvciDNYM20qQyZBMs0iHtAHvcoCFb5P1HKQcXvhnRjNYAYz6nXm40W181ZI002NZn9ZJg',
);
// node --experimental-modules public/js/stripe.js

export const bookTour = async (tourId) => {
  try {
    // Use axios from the global window object

    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YzYxYTQ3NWE5ZTZmNGYyNzBkYzg3ZCIsImlhdCI6MTc0MTI3MjU4MCwiZXhwIjoxNzQ5MDQ4NTgwfQ.GaOqJAxFbdQoncNarzOwDvh6K3CTuQE459wEYcLrQVw';

    const session = await axios({
      method: 'GET',
      url: `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
      headers: {
        Authorization: `Bearer ${token}`, // Add the token to the header
      },
    });

    if (!session.data.session.url) {
      throw new Error('Session URL not found');
    }

    // window.location.replace(session.data.session.url);
    console.log(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

// if (bookBtn) {
//   bookBtn.addEventListener('click', (e) => {
//     alert('booked');
//     console.log('booked');
//     const { tourId } = e.target.dataset;
//     console.log(tourId);
//     bookTour(tourId);
//   });
// }
// bookTour('5c88fa8cf4afda39709c2974');
// Export properly
// export default bookTour;
