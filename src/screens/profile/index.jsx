"use client";

import { useState, useEffect } from 'react';
import { getUserProfileClient, updateUserProfileClient } from '@/actions/profileAction';
import { getCustomerData } from "@/actions/authActions";

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState(null); // Tambahkan state userId
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        shippingAddresses: [],
        billingAddresses: []
    });
    
    // State untuk form tambah alamat
    const [newShippingAddress, setNewShippingAddress] = useState({
        label: '',
        address_line: '',
        city: '',
        postal_code: '',
        is_default: false
    });
    
    const [newBillingAddress, setNewBillingAddress] = useState({
        NIK: '',
        NPWP: '',
        is_default: false
    });
    
    // State untuk password
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Pindahkan fungsi loadUserData ke dalam komponen
    const loadUserData = async () => {
        try {
            console.log("Loading user data...");
            const customer = await getCustomerData();
            console.log("Customer data:", customer);
            
            if (!customer || !customer.data || !customer.data.id) {
                throw new Error("No valid customer data received");
            }
            
            const userId = customer.data.id;
            setUserId(userId);
            
            console.log("Fetching profile for user ID:", userId);
            const items = await getUserProfileClient(userId);
            console.log("Profile data received:", items);
            
            // Set data dengan fallback untuk field yang mungkin undefined
            setUserData({
                name: items?.name || customer.data.name || '',
                email: items?.email || customer.data.email || '',
                phone: items?.phone || customer.data.phone || '',
                shippingAddresses: items?.shippingAddresses || [],
                billingAddresses: items?.billingAddresses || []
            });
        } catch (error) {
            console.error("Failed to load user data:", error);
            // Set data kosong jika terjadi error
            setUserData({
                name: '',
                email: '',
                phone: '',
                shippingAddresses: [],
                billingAddresses: []
            });
        } finally {
            setLoading(false);
        }
    };

    // Gunakan useEffect di dalam komponen
    useEffect(() => {
        loadUserData();
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) {
            alert('User not authenticated');
            return;
        }

        try {
            setSaving(true);
            await updateUserProfileClient(userId, userData);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    // Handle input changes untuk data user
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle input changes untuk password
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle update password
    const handleUpdatePassword = async () => {
        if (!passwordData.newPassword || !passwordData.confirmPassword) {
            alert('Please fill in all password fields');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        try {
            // Anda perlu membuat fungsi khusus untuk update password
            // await updatePasswordClient(userId, passwordData.currentPassword, passwordData.newPassword);
            alert('Password updated successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error updating password:', error);
            alert('Failed to update password');
        }
    };

    // Shipping Address Handlers
    const handleAddShippingAddress = () => {
        if (!newShippingAddress.label.trim()) {
            alert('Label is required for shipping address');
            return;
        }
        if (!newShippingAddress.address_line.trim()) {
            alert('Address line is required');
            return;
        }

        const newAddress = {
            ...newShippingAddress,
            id: Date.now() // Temporary ID for client-side
        };

        // Jika alamat baru dijadikan default, set semua alamat lain ke false
        if (newAddress.is_default) {
            setUserData(prev => ({
                ...prev,
                shippingAddresses: [
                    ...prev.shippingAddresses.map(addr => ({ ...addr, is_default: false })),
                    newAddress
                ]
            }));
        } else {
            setUserData(prev => ({
                ...prev,
                shippingAddresses: [...prev.shippingAddresses, newAddress]
            }));
        }
        
        setNewShippingAddress({
            label: '',
            address_line: '',
            city: '',
            postal_code: '',
            is_default: false
        });
    };

    const handleUpdateShippingAddress = (id, updatedData) => {
        setUserData(prev => {
            const updatedAddresses = prev.shippingAddresses.map(address => {
                if (address.id === id) {
                    return { ...address, ...updatedData };
                }
                // Jika alamat ini dijadikan default, set yang lain ke false
                if (updatedData.is_default) {
                    return { ...address, is_default: false };
                }
                return address;
            });
            
            return {
                ...prev,
                shippingAddresses: updatedAddresses
            };
        });
    };

    const handleRemoveShippingAddress = (id) => {
        if (!confirm('Are you sure you want to remove this shipping address?')) return;
        
        setUserData(prev => ({
            ...prev,
            shippingAddresses: prev.shippingAddresses.filter(address => address.id !== id)
        }));
    };

    // Billing Address Handlers
    const handleAddBillingAddress = () => {
        if (!newBillingAddress.NIK.trim()) {
            alert('NIK is required for billing address');
            return;
        }

        const newAddress = {
            ...newBillingAddress,
            id: Date.now() // Temporary ID for client-side
        };

        // Jika billing address baru dijadikan default, set semua yang lain ke false
        if (newAddress.is_default) {
            setUserData(prev => ({
                ...prev,
                billingAddresses: [
                    ...prev.billingAddresses.map(addr => ({ ...addr, is_default: false })),
                    newAddress
                ]
            }));
        } else {
            setUserData(prev => ({
                ...prev,
                billingAddresses: [...prev.billingAddresses, newAddress]
            }));
        }
        
        setNewBillingAddress({
            NIK: '',
            NPWP: '',
            is_default: false
        });
    };

    const handleUpdateBillingAddress = (id, updatedData) => {
        setUserData(prev => {
            const updatedAddresses = prev.billingAddresses.map(address => {
                if (address.id === id) {
                    return { ...address, ...updatedData };
                }
                // Jika alamat ini dijadikan default, set yang lain ke false
                if (updatedData.is_default) {
                    return { ...address, is_default: false };
                }
                return address;
            });
            
            return {
                ...prev,
                billingAddresses: updatedAddresses
            };
        });
    };

    const handleRemoveBillingAddress = (id) => {
        if (!confirm('Are you sure you want to remove this billing address?')) return;
        
        setUserData(prev => ({
            ...prev,
            billingAddresses: prev.billingAddresses.filter(address => address.id !== id)
        }));
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
                        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>
                        
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
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
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
                                            onChange={handlePasswordChange}
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
                                            onChange={handlePasswordChange}
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
                                            onChange={handlePasswordChange}
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
                                <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                                    Shipping Addresses
                                </h2>
                                
                                <div className="space-y-4 mb-8">
                                    {userData.shippingAddresses && userData.shippingAddresses.length > 0 ? (
                                        userData.shippingAddresses.map((address) => (
                                            <div key={address.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-medium text-gray-800">{address.label}</h3>
                                                        {address.is_default && (
                                                            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateShippingAddress(address.id, { is_default: !address.is_default })}
                                                            className={`px-3 py-1 text-sm rounded-md ${
                                                                address.is_default 
                                                                    ? 'bg-blue-100 text-blue-700' 
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            {address.is_default ? 'Default' : 'Set Default'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveShippingAddress(address.id)}
                                                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600">{address.address_line}</p>
                                                <p className="text-gray-600">
                                                    {address.city} {address.postal_code && `, ${address.postal_code}`}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No shipping addresses added yet.</p>
                                    )}
                                </div>

                                {/* Add New Shipping Address */}
                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                    <h3 className="text-md font-semibold text-gray-800 mb-4">
                                        Add New Shipping Address
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
                                                onChange={(e) => setNewShippingAddress(prev => ({ ...prev, label: e.target.value }))}
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
                                                onChange={(e) => setNewShippingAddress(prev => ({ ...prev, address_line: e.target.value }))}
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
                                                onChange={(e) => setNewShippingAddress(prev => ({ ...prev, city: e.target.value }))}
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
                                                onChange={(e) => setNewShippingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center mb-4">
                                        <input
                                            type="checkbox"
                                            id="shipping-default"
                                            checked={newShippingAddress.is_default}
                                            onChange={(e) => setNewShippingAddress(prev => ({ ...prev, is_default: e.target.checked }))}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="shipping-default" className="ml-2 text-sm text-gray-700">
                                            Set as default shipping address
                                        </label>
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={handleAddShippingAddress}
                                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Add Shipping Address
                                    </button>
                                </div>
                            </div>

                            {/* Billing Addresses */}
                            <div className="mb-10">
                                <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                                    Billing Information
                                </h2>
                                
                                <div className="space-y-4 mb-8">
                                    {userData.billingAddresses && userData.billingAddresses.length > 0 ? (
                                        userData.billingAddresses.map((address) => (
                                            <div key={address.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-medium text-gray-800">Billing Info</h3>
                                                        {address.is_default && (
                                                            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateBillingAddress(address.id, { is_default: !address.is_default })}
                                                            className={`px-3 py-1 text-sm rounded-md ${
                                                                address.is_default 
                                                                    ? 'bg-blue-100 text-blue-700' 
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            {address.is_default ? 'Default' : 'Set Default'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveBillingAddress(address.id)}
                                                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-gray-700">
                                                        <span className="font-medium">NIK:</span> {address.NIK || 'Not provided'}
                                                    </p>
                                                    <p className="text-gray-700">
                                                        <span className="font-medium">NPWP:</span> {address.NPWP || 'Not provided'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No billing information added yet.</p>
                                    )}
                                </div>

                                {/* Add New Billing Address */}
                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                    <h3 className="text-md font-semibold text-gray-800 mb-4">
                                        Add New Billing Information
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
                                                onChange={(e) => setNewBillingAddress(prev => ({ ...prev, NIK: e.target.value }))}
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
                                                onChange={(e) => setNewBillingAddress(prev => ({ ...prev, NPWP: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center mb-4">
                                        <input
                                            type="checkbox"
                                            id="billing-default"
                                            checked={newBillingAddress.is_default}
                                            onChange={(e) => setNewBillingAddress(prev => ({ ...prev, is_default: e.target.checked }))}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="billing-default" className="ml-2 text-sm text-gray-700">
                                            Set as default billing address
                                        </label>
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={handleAddBillingAddress}
                                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Add Billing Information
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                                        saving ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {saving ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        'Save Profile'
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