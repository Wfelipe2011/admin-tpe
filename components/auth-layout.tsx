"use client"

import type { ReactNode } from "react"
import Image from "next/image"

interface AuthLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side with brand and illustration */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        {/* Gray rectangle background */}
        <div className="absolute w-full h-full z-10 left-0 top-0">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 616 832"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="brightness-[0.98]"
          >
            <rect
              x="-657"
              y="-136.799"
              width="930.314"
              height="1195.44"
              rx="81.75"
              transform="rotate(-20.9213 -657 -136.799)"
              fill="#EFEFF5"
            />
          </svg>
        </div>

        {/* Blue rectangle background */}
        <div className="absolute w-full h-full z-20 left-0 top-0">
          <svg width="100%" height="100%" viewBox="0 0 631 832" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_200_771)">
              <path
                d="M-722.82 340.331C-749.429 303.856 -741.431 252.717 -704.956 226.108L-85.4681 -225.82C-48.9933 -252.429 2.14633 -244.431 28.7554 -207.957L591.172 562.987C617.781 599.462 609.784 650.601 573.309 677.21L-46.1796 1129.14C-82.6544 1155.75 -133.794 1147.75 -160.403 1111.27L-722.82 340.331Z"
                fill="url(#paint0_linear_200_771)"
              />
            </g>
            <defs>
              <filter
                id="filter0_d_200_771"
                x="-756.432"
                y="-254.432"
                width="1387.22"
                height="1428.18"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx="3" dy="8" />
                <feGaussianBlur stdDeviation="10.45" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_200_771" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_200_771" result="shape" />
              </filter>
              <linearGradient
                id="paint0_linear_200_771"
                x1="9.00357"
                y1="56.9967"
                x2="581"
                y2="661"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#1E2462" />
                <stop offset="1" stopColor="#374192" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Content layer */}
        <div className="z-40 relative flex flex-col items-center w-full h-full">
          {/* Main image container with title */}
          <div className="flex flex-col items-center justify-center w-full h-full z-30 p-8">
            {/* Title */}
            <div className="z-40 text-gray-50 font-semibold text-3xl self-start mb-4 ml-8">TPE DIGITAL</div>

            {/* Image */}
            <Image
              src="/images/design-mode/login.png"
              alt="TPE Digital Dashboard Preview"
              width={1000}
              height={750}
              className="w-auto h-auto max-w-[90%] drop-shadow-2xl"
              priority
              quality={95}
            />
          </div>
        </div>
      </div>

      {/* Right side with content */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-3 sm:p-6 md:p-16 bg-white">
        <div className="md:hidden mb-6 sm:mb-8 flex flex-col items-center space-y-4 sm:space-y-6">
          <Image
            src="/images/design-mode/logo.png"
            alt="TPE Digital Logo"
            width={250}
            height={250}
            className="w-32 h-32 sm:w-48 sm:h-48"
          />
          {subtitle && (
            <p className="text-[#666666] text-center text-sm sm:text-base leading-relaxed px-2">{subtitle}</p>
          )}
        </div>

        {/* Desktop title and subtitle */}
        <div className="hidden md:block w-full max-w-md mb-8">
          {title && (
            <h1 className="text-2xl font-semibold text-[#333333] mb-3">{title}</h1>
          )}
          {subtitle && (
            <p className="text-[#666666] text-base leading-relaxed">{subtitle}</p>
          )}
        </div>

        <div className="w-full max-w-md space-y-6 sm:space-y-8 px-2 sm:px-0">{children}</div>
      </div>
    </div>
  )
}
