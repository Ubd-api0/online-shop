import Link from "next/link";
import appConfig from "@/config/appConfig";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <h1 className="text-3xl font-bold text-content">About {appConfig.name}</h1>
      <p className="leading-7 text-muted">
        {appConfig.name} is an online store built to make shopping simple and reliable. We focus
        on a curated catalogue, honest pricing and fast, transparent order handling.
      </p>
      <p className="leading-7 text-muted">
        Every order is prepared and dispatched by our own team. If something is made to order, we
        tell you the expected lead time up front so there are no surprises.
      </p>
      <p className="leading-7 text-muted">
        Questions or feedback? Reach us through the{" "}
        <Link href="/contact" className="text-brand hover:underline">
          contact page
        </Link>
        .
      </p>
    </div>
  );
}
