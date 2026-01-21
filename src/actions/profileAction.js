"use server";

import { getUserProfile, updateUserProfile } from '@/actions/profileAction';

// Fungsi wrapper untuk server actions
export async function getUserProfileClient(userId) {
  try {
    console.log('getUserProfileClient called with userId:', userId);
    // Panggil langsung server action jika sudah di-configure
    const profile = await getUserProfile(userId);
    return profile;
  } catch (error) {
    console.error('Error in client wrapper:', error);
    throw error;
  }
}

export async function updateUserProfileClient(userId, data) {
  try {
    const formData = new FormData();
    formData.append('name', data.name || '');
    formData.append('email', data.email || '');
    formData.append('phone', data.phone || '');
    formData.append('shippingAddresses', JSON.stringify(data.shippingAddresses || []));
    formData.append('billingAddresses', JSON.stringify(data.billingAddresses || []));
    
    await updateUserProfile(formData, userId);
    return { success: true };
  } catch (error) {
    console.error('Error in client wrapper:', error);
    throw error;
  }
}