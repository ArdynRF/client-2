"use server";

import { cookies as nextCookies } from "next/headers";
import { redirect } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;


export async function setCookie(name, value, options = {}) {
  const cookieStore = nextCookies();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    ...options,
  };

  cookieStore.set(name, value, cookieOptions);
}

export async function getCookie(name) {
  const cookieStore = await nextCookies();
  return cookieStore.get(name)?.value || null;
}

export async function deleteCookie(name) {
  const cookieStore = await nextCookies();
  cookieStore.delete(name);
}

// ======= AUTH ACTIONS =======

export async function registerUser(formData) {
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errRes = await response.json();
    return redirect(
      `/sign-up?errorMessage=${errRes.message || "Something went wrong."}`
    );
  }

  const resData = await response.json();
  await setCookie("customer_jwt_token", resData.token, { maxAge: 2 * 60 * 60 });

  redirect("/");
}

export async function loginUser(formData) {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errRes = await response.json();
    return redirect(
      `/login?errorMessage=${errRes.message || "Something went wrong."}`
    );
  }

  const resData = await response.json();
  await setCookie("customer_jwt_token", resData.token, { maxAge: 2 * 60 * 60 });

  redirect("/");
}

export async function getCustomerData() {
  const token = await getCookie("customer_jwt_token");

  if (!token) {
    redirect("/login");
  }

  const res = await fetch(`${BASE_URL}/api/customer`, {
    credentials: "include",
    headers: {
      Cookie: "customer_jwt_token=" + token,
    },
  });

  if (!res.ok) {
    await deleteCookie("customer_jwt_token"); 
    redirect("/login");
  }

  return res.json();
}

export async function isUserLoggedIn() {
  const token = await getCookie("customer_jwt_token");
  return token;
}

export async function logoutUser() {
  await deleteCookie("customer_jwt_token");
  redirect("/login");
}
