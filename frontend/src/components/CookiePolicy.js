import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Calendar, Cookie } from 'lucide-react';

const CookiePolicy = () => {
  return (
    <>
      <Helmet>
        <title>Cookie Policy | Jobslly</title>
        <meta name="description" content="Cookie Policy for Jobslly – Learn how we use cookies to enhance your experience on our healthcare job platform." />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-blue-900 mb-4 text-center">Cookie Policy</h1>
            <div className="flex justify-center text-sm text-gray-600 mb-8">
              <p><strong>Last Updated:</strong> January 1, 2025</p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2 flex items-center">
                <Cookie className="w-6 h-6 mr-2" />
                1. What Are Cookies?
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Cookies are small text files placed on your computer, smartphone, or tablet when you visit a website. They help us remember your preferences, improve site performance, and provide a more personalized experience.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Some cookies are essential for the website to function properly, while others help us understand how visitors use the site and improve it accordingly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">2. Types of Cookies We Use</h2>

              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">A. Essential Cookies</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>These cookies are necessary for the core functionality of the Jobslly website.</li>
                    <li>They allow you to log in, manage your account, apply for jobs, and navigate the platform securely.</li>
                    <li>Without them, some parts of the website may not function properly.</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">B. Performance & Analytics Cookies</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Used to collect information about how visitors interact with Jobslly (e.g., pages visited, time spent, clicks).</li>
                    <li>Helps us improve usability, loading speed, and site experience.</li>
                    <li>We may use tools like Google Analytics or similar third-party analytics services.</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">C. Functionality Cookies</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Remember your preferences, such as saved searches, selected language, or login details.</li>
                    <li>Enhance user experience by personalizing content and keeping you logged in between visits.</li>
                  </ul>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">D. Advertising / Marketing Cookies</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Used to show relevant job recommendations, ads, or employer promotions based on your browsing history.</li>
                    <li>These cookies may be placed by Jobslly or trusted third-party partners (e.g., Google Ads, LinkedIn).</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">E. Third-Party Cookies</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Some cookies are set by third-party integrations such as analytics, social media, or embedded videos.</li>
                    <li>We do not control these cookies; please check their individual privacy policies.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">3. How We Use Cookies</h2>
              <p className="text-gray-700 mb-4">We use cookies to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Enable secure login and authentication</li>
                <li>Save your preferences and session details</li>
                <li>Analyze traffic and improve website performance</li>
                <li>Personalize job listings and search results</li>
                <li>Deliver targeted ads or job recommendations</li>
                <li>Enhance overall platform reliability and experience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">4. Managing and Disabling Cookies</h2>
              <p className="text-gray-700 mb-4">
                You can control or disable cookies through your browser settings. However, please note that blocking certain cookies may impact your ability to use some features on Jobslly.
              </p>

              <div className="bg-yellow-50 p-6 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">Browser-specific cookie management:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>
                    <strong>Chrome:</strong> <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://support.google.com/chrome/answer/95647</a>
                  </li>
                  <li>
                    <strong>Firefox:</strong> <a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://support.mozilla.org/en-US/kb/enable-and-disable-cookies</a>
                  </li>
                  <li>
                    <strong>Safari:</strong> <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac</a>
                  </li>
                  <li>
                    <strong>Edge:</strong> <a href="https://support.microsoft.com/en-us/topic/delete-and-manage-cookies" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://support.microsoft.com/en-us/topic/delete-and-manage-cookies</a>
                  </li>
                </ul>
              </div>

              <p className="text-gray-700">
                You can also use tools such as <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Your Online Choices</a> (EU users) to manage advertising cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">5. Updates to This Cookie Policy</h2>
              <p className="text-gray-700">
                We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our practices. Updates will be posted on this page with a revised "Last Updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-gray-200 pb-2">Contact Us</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">If you have any questions about this Cookie Policy, please contact us:</p>
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

export default CookiePolicy;