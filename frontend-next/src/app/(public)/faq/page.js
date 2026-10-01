import Link from "next/link";
import { MessageCircle, Mail } from "lucide-react";
import { FaqAccordion } from "@/components/legal/faq-accordion";
import { PageHero, PageBody, HelpBanner } from "@/components/info/info-page";
import { Button } from "@/components/ui/button";
import { getFaqGroups } from "@/lib/content/faq";
import appConfig from "@/config/appConfig";

export const metadata = {
  title: "FAQ",
  description: `Answers to common questions about ordering, delivery, payments and returns at ${appConfig.name}.`,
};

export default function FAQPage() {
  const groups = getFaqGroups();
  return (
    <>
      <PageHero
        eyebrow="Help centre"
        title="Frequently asked questions"
        subtitle="Quick answers about ordering, delivery, payments, returns and your account."
      />
      <PageBody>
        <FaqAccordion groups={groups} />
        <HelpBanner text={`Our team is here ${appConfig.policies.supportHours}.`}>
          <Link href="/inbox">
            <Button>
              <MessageCircle /> Message us
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline">
              <Mail /> Contact page
            </Button>
          </Link>
        </HelpBanner>
      </PageBody>
    </>
  );
}
