import React from 'react';
import { Helmet } from 'react-helmet';
import { MapPin, Phone, Mail, Calendar } from 'lucide-react';

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions | Jobslly</title>
        <meta name="description" content="Terms and Conditions of Jobslly – A job portal connecting healthcare professionals with hospitals and recruiters. Review our user agreement and platform policies." />
        <meta name="robots" content="index, follow" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-blue-900 mb-4 text-center">Terms & Conditions</h1>
            <div className="flex justify-center text-sm text-gray-600 mb-8">
              <p><strong>Effective Date:</strong> January 1, 2025</p>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">
              Welcome to <strong>Jobslly</strong> – your trusted platform for healthcare job opportunities. By accessing or using <a href="https://www.jobslly.com" className="text-blue-600 hover:underline">www.jobslly.com</a> ("Website"), you agree to be bound by these Terms and Conditions ("Terms"). Please read them carefully before using our services.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">1. Acceptance of Terms</h2>
              <p className="text-gray-700">By creating an account or using Jobslly in any manner, you agree to comply with these Terms. If you do not agree, you may not use our platform.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">2. Description of Services</h2>
              <p className="text-gray-700">Jobslly provides an online platform connecting healthcare professionals with recruiters, hospitals, and medical institutions. Users can search for jobs, apply online, post resumes, and connect with potential employers.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">3. Eligibility</h2>
              <p className="text-gray-700">You must be at least 18 years old to register and use Jobslly. By using the site, you represent that you meet this requirement and that all information you provide is true and accurate.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">4. User Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>You agree to use Jobslly only for lawful purposes related to career opportunities in the healthcare sector.</li>
                <li>You will not post or upload false, misleading, or offensive content.</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.</li>
                <li>You agree not to misuse the website for spam, fraud, or any activity that violates applicable laws.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">5. Employer and Recruiter Terms</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Employers/recruiters may post legitimate job listings and view candidate profiles in accordance with Jobslly policies.</li>
                <li>Recruiters agree not to share candidate data outside authorized hiring processes.</li>
                <li>Job postings that are discriminatory, fraudulent, or unrelated to healthcare are strictly prohibited.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">6. Intellectual Property</h2>
              <p className="text-gray-700">All content on Jobslly — including text, graphics, logos, icons, and software — is owned or licensed by Jobslly and protected under applicable copyright and trademark laws. You may not copy, modify, or distribute our content without written consent.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">7. Limitation of Liability</h2>
              <p className="text-gray-700">Jobslly acts only as an intermediary between candidates and employers. We do not guarantee job placement or the accuracy of listings. In no event shall Jobslly, its affiliates, or employees be liable for any damages resulting from the use of our platform.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">8. Account Suspension and Termination</h2>
              <p className="text-gray-700">We reserve the right to suspend or terminate any user account that violates these Terms, our Privacy Policy, or applicable laws, without prior notice.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">9. Privacy Policy</h2>
              <p className="text-gray-700">Your use of Jobslly is also governed by our <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>. Please review it to understand how we handle your personal data.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">10. Third-Party Links</h2>
              <p className="text-gray-700">Jobslly may contain external links to third-party sites. We are not responsible for their content, terms, or policies. Accessing third-party links is at your own risk.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">11. Disclaimers</h2>
              <p className="text-gray-700">Jobslly does not guarantee uninterrupted access, error-free operation, or accuracy of job listings. The platform and its content are provided on an "as is" and "as available" basis without any warranties.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">12. Indemnification</h2>
              <p className="text-gray-700">You agree to indemnify and hold harmless Jobslly, its directors, employees, and partners from any claims, losses, or damages arising out of your use of the website or violation of these Terms.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">13. Governing Law & Jurisdiction</h2>
              <p className="text-gray-700">These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts located in Dehradun, Uttarakhand.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">14. Changes to These Terms</h2>
              <p className="text-gray-700">We may modify or update these Terms from time to time. Updates will be posted on this page with a new "Effective Date." Continued use of Jobslly indicates acceptance of the revised Terms.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">15. Contact Us</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">For any questions regarding these Terms & Conditions, please contact us:</p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span><strong>Email:</strong> <a href="mailto:support@jobslly.com" className="text-blue-600 hover:underline">support@jobslly.com</a></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span><strong>Website:</strong> <a href="https://www.jobslly.com" className="text-blue-600 hover:underline">www.jobslly.com</a></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span><strong>Address:</strong> Suite 207A/30 Campbell St, Blacktown NSW 2148, Australia</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;