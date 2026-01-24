"use client";

import { useState, useEffect } from "react";
import {
  getUserProfileClient,
  updateUserProfileClient,
  createAddressClient,
  updateAddressClient,
  deleteAddressClient,
  createBillingAddressClient,
  updateBillingAddressClient,
  deleteBillingAddressClient,
  updatePasswordClient,
} from "@/actions/profileClientActions";
import { getCustomerData } from "@/actions/authActions";
import { getUserAddress } from "@/actions/cartActions";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    shippingAddresses: [],
    billingAddresses: [],
  });

  // State untuk form tambah alamat
  const [newShippingAddress, setNewShippingAddress] = useState({
    label: "",
    address_line: "",
    city: "",
    postal_code: "",
    is_default: false,
  });

  const [newBillingAddress, setNewBillingAddress] = useState({
    NIK: "",
    NPWP: "",
    is_default: false,
  });

  // State untuk password (terpisah)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [editingShippingAddressId, setEditingShippingAddressId] =
    useState(null);
  const [editingBillingAddressId, setEditingBillingAddressId] = useState(null);

  // Load user data
  const loadUserData = async () => {
    try {
      console.log("Loading user data...");
      const customer = await getCustomerData();
      console.log("Customer data:", customer);

      if (!customer || !customer.data) {
        throw new Error("No valid customer data received");
      }

      const customerData = customer.data;
      const userId = customerData.id;
      setUserId(userId);

      console.log("Fetching profile for user ID:", userId);
      let profileData = {};

      try {
        profileData = (await getUserProfileClient(userId)) || {};
        console.log("Profile data received:", profileData);
      } catch (profileError) {
        console.log(
          "No profile data found, using customer data only:",
          profileError
        );
      }

      // Set data user
      setUserData((prev) => ({
        ...prev,
        name: profileData?.name || customerData.name || "",
        email: profileData?.email || customerData.email || "",
        phone: profileData?.phone || customerData.phone_number || "",
        billingAddresses: profileData?.billingAddresses || [],
      }));
    } catch (error) {
      console.error("Failed to load user data:", error);
      setUserData((prev) => ({
        ...prev,
        name: "",
        email: "",
        phone: "",
        shippingAddresses: [],
        billingAddresses: [],
      }));
    } finally {
      setLoading(false);
    }
  };

  // Load shipping addresses
  const getShippingAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await getUserAddress();
      console.log("Shipping addresses fetched:", response);

      if (response && response.data && Array.isArray(response.data)) {
        const formattedAddresses = response.data.map((address) => ({
          id: address.id,
          label: address.label,
          address_line: address.address_line,
          city: address.city,
          postal_code: address.postal_code,
          is_default: address.is_default,
          user_id: address.user_id,
        }));

        setUserData((prev) => ({
          ...prev,
          shippingAddresses: formattedAddresses,
        }));
      } else {
        setUserData((prev) => ({
          ...prev,
          shippingAddresses: [],
        }));
      }
    } catch (error) {
      console.error("Error fetching shipping addresses:", error);
      setUserData((prev) => ({
        ...prev,
        shippingAddresses: [],
      }));
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Load billing addresses
  const getBillingAddresses = async () => {
    try {
      const profileData = await getUserProfileClient(userId);
      if (profileData && profileData.billingAddresses) {
        setUserData((prev) => ({
          ...prev,
          billingAddresses: profileData.billingAddresses,
        }));
      }
    } catch (error) {
      console.error("Error fetching billing addresses:", error);
    }
  };

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      await loadUserData();
      await getShippingAddresses();
      if (userId) await getBillingAddresses();
    };

    loadData();
  }, [userId]);

  // ===========================
  // HANDLE SUBMIT UPDATED
  // ===========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("User not authenticated");
      return;
    }

    try {
      setSaving(true);

      // Prepare data for API - semua data kecuali password
      const profileUpdateData = {
        userId: userId,
        name: userData.name,
        phone: userData.phone,
        email: userData.email, // read-only di frontend, tapi tetap dikirim
        shippingAddresses: userData.shippingAddresses.map((addr) => ({
          id: addr.id,
          label: addr.label,
          address_line: addr.address_line,
          city: addr.city,
          postal_code: addr.postal_code,
          is_default: addr.is_default,
        })),
        billingAddresses: userData.billingAddresses.map((addr) => ({
          id: addr.id,
          NIK: addr.NIK,
          NPWP: addr.NPWP,
          is_default: addr.is_default,
        })),
        // Tambah alamat baru jika sedang diedit/ditambahkan
        newShippingAddress: editingShippingAddressId
          ? null
          : newShippingAddress.label
            ? newShippingAddress
            : null,
        newBillingAddress: editingBillingAddressId
          ? null
          : newBillingAddress.NIK
            ? newBillingAddress
            : null,
        // Untuk update alamat yang sedang diedit
        updatedShippingAddress: editingShippingAddressId
          ? {
              id: editingShippingAddressId,
              ...newShippingAddress,
            }
          : null,
        updatedBillingAddress: editingBillingAddressId
          ? {
              id: editingBillingAddressId,
              ...newBillingAddress,
            }
          : null,
      };

      console.log("Sending profile update data:", profileUpdateData);

      // Kirim semua data sekaligus ke API
      const result = await updateUserProfileClient(userId, profileUpdateData);

      if (result.success) {
        alert("Profile updated successfully!");

        // Reset forms
        setNewShippingAddress({
          label: "",
          address_line: "",
          city: "",
          postal_code: "",
          is_default: false,
        });
        setNewBillingAddress({
          NIK: "",
          NPWP: "",
          is_default: false,
        });
        setEditingShippingAddressId(null);
        setEditingBillingAddressId(null);

        // Refresh semua data
        await Promise.all([
          loadUserData(),
          getShippingAddresses(),
          getBillingAddresses(),
        ]);
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes untuk data user
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle password update (tetap terpisah)
  const handleUpdatePassword = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      alert("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const result = await updatePasswordClient(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        alert("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        throw new Error(result.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert(error.message || "Failed to update password");
    }
  };

  // Handler untuk alamat (untuk editing inline)
  const handleEditShippingAddress = (address) => {
    setNewShippingAddress({
      label: address.label,
      address_line: address.address_line,
      city: address.city,
      postal_code: address.postal_code,
      is_default: address.is_default,
    });
    setEditingShippingAddressId(address.id);
  };

  const handleEditBillingAddress = (address) => {
    setNewBillingAddress({
      NIK: address.NIK,
      NPWP: address.NPWP || "",
      is_default: address.is_default,
    });
    setEditingBillingAddressId(address.id);
  };

  // Clear form functions
  const clearShippingForm = () => {
    setNewShippingAddress({
      label: "",
      address_line: "",
      city: "",
      postal_code: "",
      is_default: false,
    });
    setEditingShippingAddressId(null);
  };

  const clearBillingForm = () => {
    setNewBillingAddress({
      NIK: "",
      NPWP: "",
      is_default: false,
    });
    setEditingBillingAddressId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">
              My Profile
            </h1>

            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="mb-10">
                <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  Basic Information
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={userData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Change Password Section */}
              <div className="mb-10">
                <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  Change Password
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleUpdatePassword}
                      className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Shipping Addresses */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Shipping Addresses
                  </h2>
                  {loadingAddresses && (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  {userData.shippingAddresses &&
                  userData.shippingAddresses.length > 0 ? (
                    userData.shippingAddresses.map((address) => (
                      <div
                        key={address.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {address.label}
                            </h3>
                            {address.is_default && (
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEditShippingAddress(address)}
                              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600">{address.address_line}</p>
                        <p className="text-gray-600">
                          {address.city}
                          {address.postal_code && `, ${address.postal_code}`}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="mt-4 text-gray-500">
                        No shipping addresses added yet.
                      </p>
                    </div>
                  )}
                </div>

                {/* Add/Edit Shipping Address Form */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-md font-semibold text-gray-800 mb-4">
                    {editingShippingAddressId
                      ? "Edit Shipping Address"
                      : "Add New Shipping Address"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Label (e.g., Home, Office)
                      </label>
                      <input
                        type="text"
                        placeholder="Label"
                        value={newShippingAddress.label}
                        onChange={(e) =>
                          setNewShippingAddress((prev) => ({
                            ...prev,
                            label: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line
                      </label>
                      <input
                        type="text"
                        placeholder="Address Line"
                        value={newShippingAddress.address_line}
                        onChange={(e) =>
                          setNewShippingAddress((prev) => ({
                            ...prev,
                            address_line: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="City"
                        value={newShippingAddress.city}
                        onChange={(e) =>
                          setNewShippingAddress((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={newShippingAddress.postal_code}
                        onChange={(e) =>
                          setNewShippingAddress((prev) => ({
                            ...prev,
                            postal_code: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="shipping-default"
                      checked={newShippingAddress.is_default}
                      onChange={(e) =>
                        setNewShippingAddress((prev) => ({
                          ...prev,
                          is_default: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="shipping-default"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Set as default shipping address
                    </label>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={clearShippingForm}
                      className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      {editingShippingAddressId ? "Cancel Edit" : "Clear Form"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Billing Addresses */}
              <div className="mb-10">
                <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  Billing Information
                </h2>

                <div className="space-y-4 mb-8">
                  {userData.billingAddresses &&
                  userData.billingAddresses.length > 0 ? (
                    userData.billingAddresses.map((address) => (
                      <div
                        key={address.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-800">
                              Billing Info
                            </h3>
                            {address.is_default && (
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEditBillingAddress(address)}
                              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-700">
                            <span className="font-medium">NIK:</span>{" "}
                            {address.NIK || "Not provided"}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">NPWP:</span>{" "}
                            {address.NPWP || "Not provided"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No billing information added yet.
                    </p>
                  )}
                </div>

                {/* Add/Edit Billing Address Form */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-md font-semibold text-gray-800 mb-4">
                    {editingBillingAddressId
                      ? "Edit Billing Information"
                      : "Add New Billing Information"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NIK
                      </label>
                      <input
                        type="text"
                        placeholder="NIK"
                        value={newBillingAddress.NIK}
                        onChange={(e) =>
                          setNewBillingAddress((prev) => ({
                            ...prev,
                            NIK: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NPWP
                      </label>
                      <input
                        type="text"
                        placeholder="NPWP"
                        value={newBillingAddress.NPWP}
                        onChange={(e) =>
                          setNewBillingAddress((prev) => ({
                            ...prev,
                            NPWP: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="billing-default"
                      checked={newBillingAddress.is_default}
                      onChange={(e) =>
                        setNewBillingAddress((prev) => ({
                          ...prev,
                          is_default: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="billing-default"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Set as default billing address
                    </label>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={clearBillingForm}
                      className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      {editingBillingAddressId ? "Cancel Edit" : "Clear Form"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                    saving ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {saving ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save All Profile Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
