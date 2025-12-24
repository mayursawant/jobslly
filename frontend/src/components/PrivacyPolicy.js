import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Calendar } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Jobslly</title>
        <meta name="description" content="Privacy Policy for Jobslly – A job portal connecting healthcare professionals with top employers. Learn how we protect and manage your personal data." />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-blue-900 mb-4 text-center">Privacy Policy</h1>
            <div className="flex justify-center space-x-8 text-sm text-gray-600 mb-8">
              <p><strong>Effective Date:</strong> January 1, 2025</p>
              <p><strong>Last Updated:</strong> January 1, 2025</p>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">
              Welcome to <strong>Jobslly</strong> – a job portal dedicated to connecting healthcare professionals with top medical institutions and employers. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use <a href="https://www.jobslly.com" className="text-blue-600 hover:underline">www.jobslly.com</a>.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">1. Information We Collect</h2>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">A. Information You Provide</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Full name, contact details, gender, and location</li>
                <li>Educational background, professional certifications, and experience details</li>
                <li>Resume/CV and other uploaded documents</li>
                <li>Account login details and communication records</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">B. Information Collected Automatically</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Device details, IP address, browser type, and operating system</li>
                <li>Cookies, analytics, and browsing activity data</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">C. Information from Third Parties</h3>
              <p className="text-gray-700 mb-4">We may receive verified professional or background information from authorized partners or employers.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Manage your Jobslly account and profile</li>
                <li>Match you with relevant healthcare job opportunities</li>
                <li>Enable employers/recruiters to contact you</li>
                <li>Send personalized job alerts and updates</li>
                <li>Improve website performance and user experience</li>
                <li>Ensure compliance with legal and security obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">3. How We Share Your Information</h2>
              <p className="text-gray-700 mb-4">We <strong>do not sell your personal information</strong>. However, we may share limited data:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>With employers when you apply for jobs or make your profile public</li>
                <li>With service providers (hosting, analytics, or support) under confidentiality agreements</li>
                <li>For legal or regulatory compliance</li>
                <li>During business transfers such as mergers or acquisitions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">4. Your Rights and Choices</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Access, update, or delete your account anytime</li>
                <li>Request removal of your data by contacting us</li>
                <li>Opt out of newsletters and job alert emails</li>
                <li>Control cookie settings through your browser</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">5. Data Security</h2>
              <p className="text-gray-700">We use advanced security measures to protect your data against unauthorized access or misuse. While we strive for full protection, no system is completely secure — we encourage users to safeguard their account credentials.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">6. Data Retention</h2>
              <p className="text-gray-700">Your information is retained only as long as necessary for legitimate business purposes or as required by law. You can request earlier deletion if desired.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">7. Children's Privacy</h2>
              <p className="text-gray-700">Jobslly is intended for users aged <strong>18 years and above</strong>. We do not knowingly collect personal data from minors.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">8. International Data Transfers</h2>
              <p className="text-gray-700">If you use Jobslly from outside India, your data may be processed in India, where privacy laws may differ from your location.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">9. Third-Party Links</h2>
              <p className="text-gray-700">Jobslly may include links to third-party websites. We are not responsible for their privacy policies or practices — please review them independently.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">10. Changes to This Policy</h2>
              <p className="text-gray-700">We may update this Privacy Policy from time to time. Updates will be reflected with a new "Last Updated" date at the top of this page. Continued use of Jobslly after updates means you agree to the revised terms.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">11. Contact Us</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">If you have any questions or concerns regarding this Privacy Policy or data usage, please reach out to us:</p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span><strong>Email:</strong> <a href="mailto:privacy@jobslly.com" className="text-blue-600 hover:underline">privacy@jobslly.com</a></span>
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

export default PrivacyPolicy;