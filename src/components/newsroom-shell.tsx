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
        <div className="mx-auto max-w-[1600px] px-[15px] pb-[64px] md:px-[30px]">{children}</div>
      </main>
      <Footer />
    </>
  );
}
