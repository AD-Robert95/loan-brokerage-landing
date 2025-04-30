import Image from "next/image"
import Link from "next/link"

export function PartnerInstitutions() {
  const partners = [
    {
      name: "금융위원회",
      logo: "/logos/fsc-logo.png",
      url: "https://www.fsc.go.kr/",
    },
    {
      name: "금융감독원",
      logo: "/logos/fss-logo.svg",
      url: "https://www.fss.or.kr/",
    },
    {
      name: "한국대부금융협회",
      logo: "/logos/clfa-logo.png",
      url: "https://www.clfa.or.kr/",
    },
    {
      name: "성남시청",
      logo: "/logos/seongnam-logo.png",
      url: "https://www.seongnam.go.kr/",
    },
  ]

  return (
    <section id="partners" className="py-8 bg-gray-50 border-t border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {partners.map((partner, index) => (
            <Link
              key={index}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={120}
                height={60}
                className="h-12 w-auto object-contain"
                priority={true}
                quality={100}
                unoptimized={true}
                style={{ maxWidth: '120px' }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
