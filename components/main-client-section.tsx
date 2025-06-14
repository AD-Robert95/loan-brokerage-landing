"use client";

import React, { useState, useEffect } from "react";
import { HeroSection } from "@/components/hero-section";
import { LoanEligibilitySection } from "@/components/loan-eligibility-section";
import { LoanProcessSection } from "@/components/loan-process-section";
import { RealTimeBanner } from "@/components/real-time-banner";
import { PartnerInstitutions } from "@/components/partner-institutions";
import { PrivacyPolicyModal } from "@/components/privacy-policy-modal";
import { TestimonialsSection } from "@/components/testimonials-section";
import { BottomConsultationBar } from "@/components/bottom-consultation-bar";
import { motion } from "framer-motion";
import type { LoanFormData, LoanResponse } from '@/types/loan';
import { toast } from "sonner";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function MainClientSection() {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("hero");

  // 리드 데이터 저장 함수
  const insertLead = async (payload: LoanFormData): Promise<LoanResponse> => {
    try {
      // API 엔드포인트 호출 (Supabase 삽입 + Google Sheets 연동)
      const response = await fetch('/api/loan-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!result.success) {
        toast.error(`상담 신청 중 오류가 발생했습니다: ${result.error}`);
        return result;
      }
      toast.success('상담 신청이 완료되었습니다!');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
      toast.error(`상담 신청 중 오류가 발생했습니다: ${errorMessage}`);
      return { success: false, error };
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "eligibility", "process", "testimonials", "faq", "realtime", "partners"];
      let currentSection = sections[0];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            currentSection = section;
          }
        }
      }
      setActiveSection(currentSection);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* activeSection이 필요한 Header는 app/page.tsx에서 직접 전달하거나, 이곳에서 렌더링 */}
      <main className="flex-1 pt-16">
        <motion.div
          id="hero"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <HeroSection onSubmit={insertLead} />
        </motion.div>
        <motion.div id="eligibility" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
          <LoanEligibilitySection />
        </motion.div>
        <motion.div id="process" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
          <LoanProcessSection />
        </motion.div>
        <motion.div id="testimonials" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
          <TestimonialsSection />
        </motion.div>
        {/* FAQSection은 app/page.tsx에서 렌더링됨 */}
        <motion.div id="realtime" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
          <RealTimeBanner />
        </motion.div>
        <motion.div id="partners" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
          <PartnerInstitutions />
        </motion.div>
      </main>
      <BottomConsultationBar onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)} />
    </>
  );
} 