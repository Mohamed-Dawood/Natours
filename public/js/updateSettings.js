import axios from 'axios';
import { showAlert } from './alert.js';

export const updateSettings = async (data, type) => {
  const url =
    type === 'password'
      ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
      : 'http://127.0.0.1:3000/api/v1/users/updateMe';
  try {
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status == 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
    }
  } catch (error) {
    console.log(error.response);
    showAlert('error', error.response.data.message);
  }
};
