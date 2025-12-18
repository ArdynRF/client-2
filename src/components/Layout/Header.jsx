"use client";

import { SearchIcon, UserIcon, CartIcon } from "@/app/icons";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Input from "../ui/Input";
import { useRouter, useSearchParams } from "next/navigation";
import { getCustomerData } from "@/actions/authActions";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const dropdownRef = useRef(null);

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
      console.log(res.data);
    };
    fetchData();
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
            <div className="flex gap-3">
              <Link href="/cart">
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
            </div>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link
                  href="/"
                  className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-100"
                >
                  My Wishlist
                </Link>
                <button className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-100 w-full text-left">
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
