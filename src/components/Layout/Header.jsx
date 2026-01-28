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

const ENV_WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ;

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
      const res = await getNegotiationsByUserId(userId);
      setTotalNegotiations(res.length || 0);
    };

    const getTotalOrderItems = async () => {
      const res = await getOrdersByUser('all', 1, 1000);
      setTotalOrders(res.data.length || 0);
      
    }

    fetchData();
    getTotalCartItems();
    getTotalNegotiationItems();
    getTotalOrderItems('all', 1, 1000);
  });

  return (
    <div className="navbar">
      <div className="container">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">MyStore</h1>

          <div className="relative w-full max-w-lg">
            <SearchIcon className="absolute left-2 top-2 w-7 h-7" />
            <Input
              placeholder="Search Product..."
              className="pl-10"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          <div className="relative" ref={dropdownRef}>
            <div className="flex gap-5">
              <Link href={`https://wa.me/${ENV_WA_NUMBER}`} target="_blank">
                <div className="relative group">
                  {/* Notification badge */}
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-green-500 text-white flex justify-center items-center text-xs font-semibold">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411" />
                    </svg>
                  </div>

                  {/* WhatsApp Icon */}
                  <div className="w-7 h-7 flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-green-500 group-hover:text-green-600 transition-colors"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411" />
                    </svg>
                  </div>

                  {/* Tooltip on hover */}
                  {/* <div className="absolute hidden group-hover:block -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50">
                    <div className="flex flex-col items-center">
                      <span>Hubungi kami lebih lanjut</span>
                      <span className="font-mono">0812-3456-789</span>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                  </div> */}
                </div>
              </Link>
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
                    {totalOrders}
                  </div>
                  <OrderIcon className="w-7 h-7" />
                </div>
              </Link>
              <button className="icon-button" onClick={toggleDropdown}>
                <UserIcon className="w-7 h-7" />
              </button>
            </div>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <Link
                  href="/"
                  className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-100"
                >
                  My Wishlist
                </Link>
                <button
                  className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-100 w-full text-left"
                  onClick={logoutUser}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
