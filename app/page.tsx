"use client"

import React, { useState, useEffect } from "react"
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
import { motion } from "framer-motion"

export default function Home(): React.ReactElement {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false)
  const [activeSection, setActiveSection] = useState<string>("hero")

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

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

      const scrollPosition = window.scrollY + 100

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
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <HeroSection />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <LoanEligibilitySection />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <LoanProcessSection />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <TestimonialsSection />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <FaqSection />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <RealTimeBanner />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <PartnerInstitutions />
        </motion.div>
      </main>
      <Footer />
      <BottomConsultationBar onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)} />
      <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
    </div>
  )
}
