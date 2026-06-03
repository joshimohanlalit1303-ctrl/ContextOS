/* eslint-disable */

export default function TermsOfService() {
  return (
    <article className="max-w-3xl mx-auto py-24 px-6 prose prose-invert prose-headings:font-bold prose-a:text-accent">
      <h1 className="text-4xl mb-4">Terms of Service</h1>
      <p className="text-muted mb-12">Last Updated: October 2026</p>

      <section className="mb-12">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the ContextOS API, SDKs, or dashboard (collectively, the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
        </p>
      </section>

      <section className="mb-12">
        <h2>2. Description of Service</h2>
        <p>
          ContextOS provides memory infrastructure and vectorization APIs for artificial intelligence applications. The Service allows developers to store, retrieve, and manage semantic context for their end-users. We reserve the right to modify, suspend, or discontinue the Service at any time with reasonable notice.
        </p>
      </section>

      <section className="mb-12">
        <h2>3. API Usage and Fair Use</h2>
        <p>
          You agree to use the API in accordance with your subscribed tier's rate limits. ContextOS employs automated rate limiting and abuse detection. We reserve the right to throttle or suspend API keys that generate disproportionate load, engage in malicious scraping, or violate our Acceptable Use Policy.
        </p>
        <p>
          Our <strong>Local Edge Vectorization</strong> pipeline operates within your application's compute environment. You are responsible for ensuring your deployment platform (e.g., Vercel, AWS) permits the execution of the necessary Node.js binaries and machine learning models required by our SDK.
        </p>
      </section>

      <section className="mb-12">
        <h2>4. Data Privacy & Security</h2>
        <p>
          Your data is governed by our <a href="/privacy">Privacy Policy</a>. You are solely responsible for ensuring you have obtained necessary consent from your end-users before transmitting their personal data or conversations to the ContextOS API.
        </p>
      </section>

      <section className="mb-12">
        <h2>5. Limitation of Liability</h2>
        <p>
          In no event shall ContextOS be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of your use or inability to use the Service.
        </p>
      </section>
    </article>
  );
}
