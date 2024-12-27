"use client"; // Declare the component as a client-side component

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  const { userId } = useAuth(); // Client-side hook

  return (
    <nav className="bg-cyan-950 rounded-b-xl">
      <ul className="flex justify-between py-4 px-6 items-center">
        <li>
          <Link href="/" className="text-white hover:underline" aria-label="Home">
            Home
          </Link>
        </li>
        <li>
          <Link href="/client" className="text-white hover:underline" aria-label="Client Page">
            Client Page
          </Link>
        </li>
        <li className="flex gap-6 items-center">
          {!userId ? (
            <>
              <Link href="/sign-in" className="text-white hover:underline" aria-label="Login">
                Login
              </Link>
              <Link href="/sign-up" className="text-white hover:underline" aria-label="Sign Up">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link href="/profile" className="text-white hover:underline" aria-label="Profile">
                Profile
              </Link>
              <UserButton />
            </>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
