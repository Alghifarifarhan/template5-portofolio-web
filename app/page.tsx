import Header from "@/components/Header";
import HeroIntro from "@/components/HeroIntro";
import CertificatesSection from "@/components/CertificatesSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-dvh min-w-80 transition-colors">
      {/* Page Content */}
      <main
        id="page-content"
        className="mx-auto flex max-w-6xl flex-auto flex-col px-4 pb-4 lg:px-8 lg:pb-8"
      >
        {/* Header */}
        <Header />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <HeroIntro />
          <CertificatesSection />
          <ContactSection />
          <Footer />
        </div>
      </main>
    </div>
  );
}
