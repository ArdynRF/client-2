"use client";

import {
  SearchIcon,
  UserIcon,
  CartIcon,
  NegotiateIcon,
  OrderIcon,
} from "@/app/icons";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Input from "../ui/Input";
import { useRouter, useSearchParams } from "next/navigation";
import { getCustomerData, logoutUser } from "@/actions/authActions";
import { getCartTotal } from "@/actions/cartActions";
import { getNegotiationsByUserId } from "@/actions/negotiationActions";
import { getOrdersByUser } from "@/actions/checkoutActions";

const ENV_WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER;

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const dropdownRef = useRef(null);
  const [totalCarts, setTotalCarts] = useState(0);
  const [totalNegotiations, setTotalNegotiations] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentParams = new URLSearchParams(searchParams.toString());

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // 🔍 Live search handler — run on each keystroke
  useEffect(() => {
    const updatedParams = new URLSearchParams(currentParams);
    const trimmedKeyword = searchKeyword.trim().toLowerCase();

    if (!trimmedKeyword) {
      updatedParams.delete("search");
    } else {
      updatedParams.set("search", trimmedKeyword);
    }

    router.replace(`/?${updatedParams.toString()}`, {
      scroll: false,
      shallow: true,
    });
  }, [searchKeyword]); // 🚀 Run when user types

  useEffect(() => {
    const fetchData = async () => {
      const res = await getCustomerData();
      setUserId(res.data.id);
    };

    const getTotalCartItems = async () => {
      const res = await getCartTotal();
      setTotalCarts(res.itemCount || 0);
    };

    const getTotalNegotiationItems = async () => {
      if (userId) {
        const res = await getNegotiationsByUserId(userId);
        setTotalNegotiations(res.length || 0);
      }
    };

    const getTotalOrderItems = async () => {
      const res = await getOrdersByUser("all", 1, 1000);
      setTotalOrders(res.data.length || 0);
    };

    fetchData();
    getTotalCartItems();
    getTotalNegotiationItems();
  });

  return (
    <header className="w-full bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                MyStore
              </h1>
            </Link>
          </div>

          {/* Search Bar - Full width on desktop */}
          <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <div className="flex gap-3">
              <Link href="/negotiate">
                <div className="relative">
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex justify-center items-center text-xs font-semibold">
                    {totalNegotiations}
                  </div>
                  <NegotiateIcon className="w-7 h-7" />
                </div>
              </Link>
              <Link href="/cart">
                <div className="relative">
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex justify-center items-center text-xs font-semibold">
                    {totalCarts}
                  </div>
                  <CartIcon className="w-7 h-7" />
                </div>
              </Link>
              <Link href="/order">
                <div className="relative">
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex justify-center items-center text-xs font-semibold">
                    0
                  </div>
                  <CartIcon className="w-7 h-7" />
                </div>
              </Link>
              <button className="icon-button" onClick={toggleDropdown}>
                <UserIcon className="w-7 h-7" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      My Profile
                    </div>
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      My Wishlist
                    </div>
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors md:hidden"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      My Orders
                    </div>
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      logoutUser();
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
