import IslamicCTASection from "../components/IslamicCTASection";
import ParentReviewsMarquee from "../components/ParentReviewsMarquee";
import ExtraSection from "../components/ui/extraSection";
import HomePage from "../components/ui/MainPage";

export default function Home() {
  return (
    <div>
      <HomePage></HomePage>
      <ExtraSection></ExtraSection>
      <ParentReviewsMarquee></ParentReviewsMarquee>
      <IslamicCTASection></IslamicCTASection>
    </div>
  );
}
