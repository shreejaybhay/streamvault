// src/components/Footer.jsx

import React from "react";
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt 
} from "react-icons/fa";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="py-16 px-6 text-base-content bg-base-300 bg-opacity-70 backdrop-blur-md">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          {/* Brand Section */}
          <div className="text-center md:text-left md:max-w-xs">
            <h2 className="mb-4 text-2xl font-bold">StreamVault</h2>
            <p className="mb-6 text-base-content/80">
              The best place to stream your favorite content. Join us and
              explore a vast library of movies, TV shows, and more.
            </p>
            <div className="flex justify-center md:justify-start space-x-3">
              <a 
                href="https://facebook.com" 
                aria-label="Facebook"
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
              >
                <FaFacebook size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                aria-label="Twitter"
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
              >
                <FaTwitter size={20} />
              </a>
              <a 
                href="https://www.instagram.com/___shree___26/" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
              >
                <FaInstagram size={20} />
              </a>
              <a 
                href="https://www.linkedin.com/in/shree-jaybhay-084014316/" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
              >
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="text-center md:text-left">
            <h3 className="mb-5 text-xl font-semibold">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-lg font-medium hover:text-primary transition-all duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-lg font-medium hover:text-primary transition-all duration-300">
                  About
                </Link>
              </li>
              <li>
                <Link href="/movies" className="text-lg font-medium hover:text-primary transition-all duration-300">
                  Movies
                </Link>
              </li>
              <li>
                <Link href="/shows" className="text-lg font-medium hover:text-primary transition-all duration-300">
                  TV Shows
                </Link>
              </li>
              <li>
                <Link href="/animes" className="text-lg font-medium hover:text-primary transition-all duration-300">
                  Animes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="text-center md:text-left">
            <h3 className="mb-5 text-xl font-semibold">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center justify-center md:justify-start gap-3">
                <FaEnvelope className="text-primary" />
                <a 
                  href="mailto:shreejaybhay26@gmail.com"
                  className="hover:text-primary transition-colors duration-300"
                >
                  shreejaybhay26@gmail.com
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <FaPhone className="text-primary" />
                <a 
                  href="tel:+15551234567"
                  className="hover:text-primary transition-colors duration-300"
                >
                  +1 (555) 123-4567
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <FaMapMarkerAlt className="text-primary" />
                <span>123 StreamVault Ave, Stream City, ST 12345</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-8 text-center border-t border-base-content/20">
          <p className="mb-2">
            &copy; {new Date().getFullYear()} StreamVault. All rights reserved.
          </p>
          <p className="text-base-content/70">
            Developed with ❤️ by Shree Jaybhay
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
