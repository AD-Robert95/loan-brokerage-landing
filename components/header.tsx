"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface HeaderProps {
  activeSection: string
}

export function Header({ activeSection }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 64, // Adjust for header height
        behavior: "smooth",
      })
    }
    setIsMobileMenuOpen(false)
  }

  const navItems = [
    { id: "hero", label: "대출 안내" },
    { id: "eligibility", label: "신청 대상" },
    { id: "process", label: "진행 과정" },
    { id: "testimonials", label: "문의 현황" },
    { id: "faq", label: "자주 묻는 질문" },
    { id: "partners", label: "제휴사" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href="/" className="text-xl font-bold text-blue-600">
              대출브라더스대부중개
            </Link>
            <div className="text-sm text-gray-600 md:hidden">2022-경기성남-0022-중개</div>
            <button className="md:hidden text-gray-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden w-full mt-4 bg-white rounded-lg shadow-lg p-4">
              <nav className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeSection === item.id
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          )}

          <div className="hidden md:flex items-center space-x-1">
            <nav className="flex space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeSection === item.id
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="ml-4 text-sm text-gray-600">2022-경기성남-0022-중개</div>
          </div>
        </div>
      </div>
    </header>
  )
}
