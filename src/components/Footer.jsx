// src/components/Footer.jsx

import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="py-10 text-base-content bg-base-300">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h2 className="mb-4 text-2xl font-bold">StreamVault</h2>
            <p className="mb-4">
              The best place to stream your favorite content. Join us and
              explore a vast library of movies, TV shows, and more.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" aria-label="Facebook">
                <FaFacebook size={24} />
              </a>
              <a href="https://twitter.com" aria-label="Twitter">
                <FaTwitter size={24} />
              </a>
              <a href="https://www.instagram.com/___shree___26/" target="_blank" aria-label="Instagram">
                <FaInstagram size={24} />
              </a>
              <a href="https://www.linkedin.com/in/shree-jaybhay-084014316/" target="_blank" aria-label="LinkedIn">
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-xl font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="" className="hover:underline">
                  About
                </a>
              </li>
              <li>
                <a href="" className="hover:underline">
                  Services
                </a>
              </li>
              <li>
                <a href="" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-xl font-semibold">Contact Us</h3>
            <ul className="space-y-2">
              <li>Email: shreejaybhay26@gmail.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 StreamVault Ave, Stream City, ST 12345</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p>
            &copy; {new Date().getFullYear()} StreamVault. All rights reserved.
          </p>
          <p>Developed by Shree Jaybhay.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
