"use client";

import { useEffect, useState } from "react";
import { Edit, Mail, Phone, MapPin, Wallet } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setFormData(parsed);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const data = await response.json();
      setUser(data.data);
      localStorage.setItem("userData", JSON.stringify(data.data));
      setIsEditing(false);
      alert("Profile updated successfully");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Edit size={18} />
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        {isEditing ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-md p-6 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="p-2 border border-gray-300 rounded"
              />
            </div>

            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full p-2 border border-gray-300 rounded bg-gray-100"
            />

            <input
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              placeholder="Phone"
              className="w-full p-2 border border-gray-300 rounded"
            />

            <div className="space-y-2 border-t pt-4">
              <h3 className="font-bold mb-2">Address</h3>
              <input
                type="text"
                value={formData.address?.street || ""}
                onChange={(e) => handleAddressChange("street", e.target.value)}
                placeholder="Street"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={formData.address?.city || ""}
                onChange={(e) => handleAddressChange("city", e.target.value)}
                placeholder="City"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.address?.state || ""}
                  onChange={(e) => handleAddressChange("state", e.target.value)}
                  placeholder="State"
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={formData.address?.postalCode || ""}
                  onChange={(e) =>
                    handleAddressChange("postalCode", e.target.value)
                  }
                  placeholder="Postal Code"
                  className="p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">First Name</p>
                  <p className="font-semibold">{user.firstName}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Last Name</p>
                  <p className="font-semibold">{user.lastName}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail size={18} className="text-gray-600" />
                  <div>
                    <p className="text-gray-600 text-sm">Email</p>
                    <p className="font-semibold">{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-gray-600" />
                    <div>
                      <p className="text-gray-600 text-sm">Phone</p>
                      <p className="font-semibold">{user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            {user.address && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MapPin size={20} /> Address
                </h2>
                <p className="font-semibold">{user.address.street}</p>
                <p className="text-gray-600">
                  {user.address.city}, {user.address.state}{" "}
                  {user.address.postalCode}
                </p>
              </div>
            )}

            {/* Wallet */}
            {user.wallet && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Wallet size={20} /> Wallet Balance
                </h2>
                <p className="text-3xl font-bold text-green-600">
                  ${user.wallet.balance.toFixed(2)}
                </p>
              </div>
            )}

            {/* Role Badge */}
            <div className="bg-blue-50 rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-1">Account Type</p>
              <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded font-semibold capitalize">
                {user.role}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
