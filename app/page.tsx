"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { LoanEligibilitySection } from "@/components/loan-eligibility-section"
import { FaqSection } from "@/components/faq-section"
import { LoanProcessSection } from "@/components/loan-process-section"
import { RealTimeBanner } from "@/components/real-time-banner"
import { PartnerInstitutions } from "@/components/partner-institutions"
import { Footer } from "@/components/footer"
import { BottomConsultationBar } from "@/components/bottom-consultation-bar"
import { PrivacyPolicyModal } from "@/components/privacy-policy-modal"
import { TestimonialsSection } from "@/components/testimonials-section"

export default function Home() {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: "hero", element: document.getElementById("hero") },
        { id: "eligibility", element: document.getElementById("eligibility") },
        { id: "process", element: document.getElementById("process") },
        { id: "testimonials", element: document.getElementById("testimonials") },
        { id: "faq", element: document.getElementById("faq") },
        { id: "partners", element: document.getElementById("partners") },
      ]

      const scrollPosition = window.scrollY + 100 // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section.element && scrollPosition >= section.element.offsetTop) {
          setActiveSection(section.id)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header activeSection={activeSection} />
      <main className="flex-1 pt-16">
        <HeroSection />
        <LoanEligibilitySection />
        <LoanProcessSection />
        <TestimonialsSection />
        <FaqSection />
        <RealTimeBanner />
        <PartnerInstitutions />
      </main>
      <Footer />
      <BottomConsultationBar onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)} />
      <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
    </div>
  )
}
