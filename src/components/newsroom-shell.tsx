import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

/**
 * Contained shell for the newsroom. Centers everything in a measured column with
 * generous side margins so the layout never stretches edge-to-edge on wide
 * screens (the New-York-Times approach), in our minimal house style.
 */
export function NewsroomShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header solid />
      <main className="bg-cream pt-[60px]">
        <div className="mx-auto max-w-[1180px] px-[20px] pb-[72px] md:px-[40px]">{children}</div>
      </main>
      <Footer />
    </>
  );
}
