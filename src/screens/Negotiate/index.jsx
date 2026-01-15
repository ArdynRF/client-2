// Di NegotiationsPage component
"use client";

import { useState, useEffect } from "react";
import NegotiationList from "@/components/ui/NegotiationList";
import Button from "@/components/ui/Button";
import { getCustomerData } from "@/actions/authActions";
import { getNegotiationsByUserId } from "@/actions/negotiationActions";
import { handleDeleteNegotiation } from "@/actions/negotiationActions";

export default function NegotiationsPage() {
  const [allNegotiations, setAllNegotiations] = useState([]);
  const [filteredNegotiations, setFilteredNegotiations] = useState([]);
  const [selectedNegotiations, setSelectedNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all"); // "all", "pending", "accepted", "rejected", "expired"

  const loadNegotiateData = async () => {
    try {
       const customer = await getCustomerData();
      const userId = customer.data.id;
      const items = await getNegotiationsByUserId(userId);
      
      setAllNegotiations(items || []);
    } catch (error) {
      console.error("Failed to load negotiations:", error);
      setAllNegotiations([]);
    } finally {
      setLoading(false);
    }
  };


  // Load negotiations data
  useEffect(() => {
    loadNegotiateData();
  }, []);

  // Filter negotiations based on active filter
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredNegotiations(allNegotiations);
    } else {
      const filtered = allNegotiations.filter(
        (item) => item.status === activeFilter
      );
      setFilteredNegotiations(filtered);
    }

    // Reset selected items when filter changes
    setSelectedNegotiations([]);
  }, [activeFilter, allNegotiations]);

  // Calculate statistics
  const stats = {
    total: allNegotiations.length,
    pending: allNegotiations.filter((item) => item.status === "pending").length,
    accepted: allNegotiations.filter((item) => item.status === "accepted")
      .length,
    rejected: allNegotiations.filter((item) => item.status === "rejected")
      .length,
    expired: allNegotiations.filter((item) => item.status === "expired").length,
  };

  // Status filter buttons configuration
  const filterButtons = [
    {
      id: "all",
      label: "Total",
      count: stats.total,
      bgColor: "bg-white",
      textColor: "text-gray-900",
      borderColor: "border-gray-200",
      hoverColor: "hover:bg-gray-50",
    },
    {
      id: "pending",
      label: "Pending",
      count: stats.pending,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-200",
      hoverColor: "hover:bg-yellow-100",
    },
    {
      id: "accepted",
      label: "Accepted",
      count: stats.accepted,
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
      hoverColor: "hover:bg-green-100",
    },
    {
      id: "rejected",
      label: "Rejected",
      count: stats.rejected,
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200",
      hoverColor: "hover:bg-red-100",
    },
    {
      id: "expired",
      label: "Expired",
      count: stats.expired,
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
      borderColor: "border-gray-300",
      hoverColor: "hover:bg-gray-200",
    },
  ];

  const handleDeleteNegotiations = async () => {
    if (selectedNegotiations.length === 0) return;

    if (
      !confirm(`Delete ${selectedNegotiations.length} selected negotiation(s)?`)
    ) {
      return;
    }

    try {
      const response = await handleDeleteNegotiation(selectedNegotiations);
      if (response.success) {
        alert("Selected negotiations deleted successfully.");
        // Refresh negotiations list
        const customer = await getCustomerData();
        const userId = customer.data.id;
        const negotiationsData = await getNegotiationsByUserId(userId);
        setAllNegotiations(negotiationsData || []);
        setSelectedNegotiations([]);
      }
    } catch (error) {
      console.error("Failed to delete negotiations:", error);
      alert("Failed to delete negotiations");
    }
  };

  // Handle filter button click
  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
  };

  // Handle select/deselect all (for current filtered view)
  const handleSelectAll = () => {
    if (selectedNegotiations.length === filteredNegotiations.length) {
      setSelectedNegotiations([]);
    } else {
      setSelectedNegotiations(filteredNegotiations.map((item) => item.id));
    }
  };

  // Handle single item selection
  const handleSelectItem = (itemId) => {
    setSelectedNegotiations((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // ... rest of your functions (delete, move to cart, etc.)

  if (loading) {
    return (
      <div className="my-10 max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-semibold mb-6">My Negotiations</h1>
        <div className="text-center py-10">Loading negotiations...</div>
      </div>
    );
  }

  return (
    <div className="my-10 max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-semibold mb-2">My Negotiations</h1>
      <p className="text-gray-600 mb-6">
        Manage your product price negotiations
      </p>

      {allNegotiations.length === 0 ? (
        <div className="text-center mt-10 text-gray-500 bg-white rounded-lg p-8 shadow-sm">
          <div className="text-lg mb-4">
            You don't have any negotiations yet.
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => (window.location.href = "/products")}
          >
            Browse Products
          </Button>
        </div>
      ) : (
        <>
          {/* Filter Stats as Clickable Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {filterButtons.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter.id)}
                className={`
                  rounded-lg p-4 shadow-sm border-2 text-left transition-all duration-200
                  ${filter.bgColor}
                  ${filter.borderColor}
                  ${filter.hoverColor}
                  ${
                    activeFilter === filter.id
                      ? "ring-2 ring-blue-500 ring-offset-2"
                      : ""
                  }
                `}
              >
                <div className={`text-2xl font-bold ${filter.textColor}`}>
                  {filter.count}
                </div>
                <div className={`text-sm ${filter.textColor} opacity-80`}>
                  {filter.label}
                </div>
                {activeFilter === filter.id && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    ✓ Active filter
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Active Filter Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <span className="font-medium text-blue-800">
                  Showing {filteredNegotiations.length} of{" "}
                  {allNegotiations.length} negotiations
                </span>
                {activeFilter !== "all" && (
                  <span className="ml-2 text-blue-600">
                    (Filtered by:{" "}
                    <span className="font-bold">{activeFilter}</span>)
                  </span>
                )}
              </div>
              <div className="mt-2 md:mt-0">
                <Button
                  onClick={() => setActiveFilter("all")}
                  className="text-sm bg-white text-blue-600 border border-blue-300 hover:bg-blue-50"
                  disabled={activeFilter === "all"}
                >
                  Clear Filter
                </Button>
              </div>
            </div>
          </div>

          {/* Header with Actions */}
          {filteredNegotiations.length > 0 && (
            <div className="bg-white rounded-t-lg shadow-sm p-4 mb-2 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="select-all-negotiations"
                    checked={
                      selectedNegotiations.length ===
                        filteredNegotiations.length &&
                      filteredNegotiations.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="select-all-negotiations"
                    className="ml-2 text-sm font-medium text-gray-900"
                  >
                    Select All ({selectedNegotiations.length}/
                    {filteredNegotiations.length})
                  </label>
                </div>

                {selectedNegotiations.length > 0 && (
                  <Button
                    onClick={handleDeleteNegotiations}
                    className="bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
                  >
                    Delete Selected ({selectedNegotiations.length})
                  </Button>
                )}
              </div>

              <div className="text-sm text-gray-600">
                Showing {filteredNegotiations.length} negotiation(s)
              </div>
            </div>
          )}

          {/* Negotiations List */}
          {filteredNegotiations.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <div className="text-gray-500 mb-4">
                No {activeFilter !== "all" ? activeFilter : ""} negotiations
                found
              </div>
              {activeFilter !== "all" && (
                <Button
                  onClick={() => setActiveFilter("all")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Show All Negotiations
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNegotiations.map((item) => (
                <NegotiationList
                  key={item.id}
                  negotiation={item}
                  isSelected={selectedNegotiations.includes(item.id)}
                  onSelect={() => handleSelectItem(item.id)}
                  onMoveToCart={() => handleMoveToCart(item.id)}
                  onReject={() => handleRejectNegotiation(item.id)}
                  onRenegotiate={() => handleRenegotiate(item.id)}
                  onRemoveSuccess={loadNegotiateData}
                />
              ))}
            </div>
          )}

          {/* Bottom Action Bar */}
          {selectedNegotiations.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6 sticky bottom-0 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-semibold">
                    {selectedNegotiations.length} negotiation(s) selected
                  </div>
                  <div className="text-gray-600 text-sm">
                    Filter: {activeFilter}
                  </div>
                </div>

                <div className="space-x-3">
                  <Button
                    className="border border-gray-300 text-white hover:bg-gray-50 hover:text-gray-700"
                    onClick={handleDeleteNegotiations}
                  >
                    Delete Selected
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
