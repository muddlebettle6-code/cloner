import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { QuoteBlock } from "@/components/quote-block";
import { MediaBand } from "@/components/media-band";
import { Intro } from "@/components/Intro";
import { Methods } from "@/components/Methods";
import { Approach } from "@/components/Approach";
import { Research } from "@/components/Research";
import { Projects } from "@/components/Projects";
import { Systems } from "@/components/Systems";
import { About } from "@/components/About";
import { Principles } from "@/components/Principles";
import { Collaborate } from "@/components/Collaborate";
import { Manifesto } from "@/components/Manifesto";
import { Footer } from "@/components/Footer";
import { VideoBand } from "@/components/video-band";
import { POSITIONING, OPERATING_STATEMENT } from "@/lib/site-data";
import { BAND_VIDEO, BAND_POSTER, BAND_CAPTION, BAND_RELATION, PIPELINE_BAND } from "@/lib/site-images";

export default function Home() {
  return (
    <>
      <Header />
      <main className="w-full overflow-x-hidden">
        <Hero />
        <QuoteBlock statement={POSITIONING} />
        <VideoBand src={BAND_VIDEO} poster={BAND_POSTER} caption={BAND_CAPTION} relation={BAND_RELATION} height="h-[360px] md:h-[576px]" />
        <Intro />
        <Methods />
        <Approach />
        <Research />
        <Projects />
        <MediaBand images={[PIPELINE_BAND[0], PIPELINE_BAND[1]]} alt="Blue abstract" height="h-[280px] md:h-[523px]" />
        <Systems />
        <QuoteBlock statement={OPERATING_STATEMENT} />
        <About />
        <Principles />
        <Collaborate />
        <Manifesto />
      </main>
      <Footer />
    </>
  );
}
