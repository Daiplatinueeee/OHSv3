import { useState, useEffect } from "react"
import { X, ChevronRight, CheckCircle2 } from "lucide-react"

interface TermsConditionProps {
  onClose: (accepted: boolean) => void
}

const termsContent = [
  {
    id: 1,
    title: "Introduction and Acceptance of Terms",
    content: `
      <p class="mb-4 text-gray-700">Welcome to HandyGo! These Terms and Services ("Terms") govern your access to and use of the HandyGo website, mobile applications, and services (collectively, the "Platform"). By accessing or using the Platform, you signify that you have read, understood, and agree to be bound by these Terms, whether or not you are a registered user of our Platform. If you do not agree with these Terms, you must not use or access the Platform.</p>
      <p class="mb-4">We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. Your continued use of the Platform after any such changes constitutes your acceptance of the new Terms. It is your responsibility to review these Terms periodically for changes.</p>
      <p class="mb-4">This document outlines the legal framework for your interaction with HandyGo, ensuring clarity on both your rights and obligations, as well as ours. We are committed to fostering a transparent and secure environment for all users. Your engagement with our Platform is a direct acknowledgment of your understanding and agreement to these provisions.</p>
      <p class="mb-4">Please note that these Terms are legally binding. If you have any questions or concerns regarding these Terms, we encourage you to contact us before using the Platform. Your understanding of these terms is crucial for a smooth and beneficial experience on HandyGo.</p>
      <p class="mb-4">This section is designed to ensure that all users are fully aware of their commitment when they begin using our services. It emphasizes the importance of reading and understanding the terms, as well as our policy on updates and revisions. We believe in clear communication and want to ensure that there are no ambiguities regarding the contractual relationship between you and HandyGo.</p>
      <p class="mb-4">By proceeding, you acknowledge that you have the legal capacity to enter into this agreement and that you are at least 18 years old or have reached the age of majority in your jurisdiction. If you are accessing or using the Platform on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these Terms.</p>
    `
  },
  {
    id: 2,
    title: "User Accounts and Registration",
    content: `
      <p class="mb-4">To access certain features of the Platform, you must register for an account. When registering, you agree to provide accurate, current, and complete information as prompted by our registration forms. You also agree to maintain and promptly update your account information to keep it accurate, current, and complete. Failure to do so may result in the suspension or termination of your account.</p>
      <p class="mb-4">You are solely responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify HandyGo immediately of any unauthorized use of your account or any other breach of security. HandyGo will not be liable for any loss or damage arising from your failure to comply with this security obligation.</p>
      <p class="mb-4">We reserve the right to refuse registration or cancel an account at our discretion. This may occur if we suspect fraudulent activity, violation of these Terms, or any other reason deemed necessary to protect the integrity of our Platform and its users. Account security is a shared responsibility, and we rely on your diligence to keep your credentials safe.</p>
      <p class="mb-4">When creating your account, you may be asked to select an account type (e.g., Customer or Manager). Each account type may have specific requirements and functionalities. It is your responsibility to choose the appropriate account type that aligns with your intended use of the Platform.</p>
      <p class="mb-4">Please ensure that your email address is current and accessible, as it will be our primary method of communication regarding your account, security alerts, and important updates. We recommend using a strong, unique password for your HandyGo account to minimize security risks.</p>
      <p class="mb-4">By registering, you also consent to receive electronic communications from us, which may include notices about your account, service updates, and promotional materials. You can manage your communication preferences within your account settings.</p>
    `
  },
  {
    id: 3,
    title: "Privacy Policy Overview",
    content: `
      <p class="mb-4">Your privacy is paramount to us. Our Privacy Policy, which is incorporated by reference into these Terms, describes how we collect, use, and disclose your personal information. By using the Platform, you consent to the collection, use, and disclosure of your information as described in our Privacy Policy. We are committed to protecting your privacy and ensuring the security of your data in compliance with applicable data protection laws, including the Data Privacy Act (DPA) in the Philippines.</p>
      <p class="mb-4">We collect various types of information, including personal data (such as your name, email address, contact number, and payment information), usage data (like IP addresses, browser types, and access times), and information related to your interactions with the Platform. This data is used to provide, maintain, and improve our services, process transactions, communicate with you, and for security purposes.</p>
      <p class="mb-4">We implement robust security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include encryption, firewalls, and secure socket layer technology. However, no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
      <p class="mb-4">You have certain rights regarding your personal data, including the right to access, correct, or delete your information. For more details on how to exercise these rights, please refer to our full Privacy Policy. We may share your information with trusted third-party service providers who assist us in operating our Platform and delivering services, always under strict confidentiality agreements.</p>
      <p class="mb-4">Our Privacy Policy also details our use of cookies and similar tracking technologies to enhance your experience on the Platform. You can manage your cookie preferences through your browser settings. We encourage you to review our Privacy Policy regularly for any updates.</p>
      <p class="mb-4">By continuing to use HandyGo, you acknowledge that you have read and understood our Privacy Policy and agree to its terms. Your trust is important to us, and we are dedicated to maintaining the highest standards of data protection.</p>
    `
  },
  {
    id: 4,
    title: "Acceptable Use and Conduct",
    content: `
      <p class="mb-4">You agree to use the Platform only for lawful purposes and in a manner that does not infringe the rights of, or restrict or inhibit the use and enjoyment of the Platform by any third party. Prohibited conduct includes, but is not limited to, transmitting any unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable material, or engaging in any conduct that would constitute a criminal offense, give rise to civil liability, or otherwise violate any applicable local, national, or international law.</p>
      <p class="mb-4">You must not misuse our Platform by knowingly introducing viruses, trojans, worms, logic bombs, or other material that is malicious or technologically harmful. You must not attempt to gain unauthorized access to our Platform, the server on which our Platform is stored, or any server, computer, or database connected to our Platform. You must not attack our Platform via a denial-of-service attack or a distributed denial-of-service attack.</p>
      <p class="mb-4">Any breach of this provision may result in immediate termination of your account, reporting to relevant law enforcement authorities, and legal action. We reserve the right to monitor user activity and content to ensure compliance with these Terms and to protect the safety and security of our community.</p>
      <p class="mb-4">Furthermore, you agree not to use the Platform to: (a) impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity; (b) collect or store personal data about other users without their express consent; (c) engage in spamming, phishing, or any other form of unsolicited communication; or (d) interfere with or disrupt the integrity or performance of the Platform or the data contained therein.</p>
      <p class="mb-4">We expect all users to interact respectfully and professionally. Any form of harassment, discrimination, or hate speech is strictly prohibited. Our goal is to create a positive and productive environment for everyone. Violations of this acceptable use policy will be taken seriously and may lead to permanent suspension from the Platform.</p>
    `
  },
  {
    id: 5,
    title: "Intellectual Property Rights",
    content: `
      <p class="mb-4">All content on this Platform, including but not limited to text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of HandyGo or its content suppliers and protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. The compilation of all content on this Platform is the exclusive property of HandyGo and protected by international copyright laws.</p>
      <p class="mb-4">You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Platform, except as generally permitted by these Terms. Any unauthorized use of our intellectual property is strictly prohibited and may result in severe civil and criminal penalties.</p>
      <p class="mb-4">HandyGo's name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of HandyGo or its affiliates or licensors. You must not use such marks without the prior written permission of HandyGo. All other names, logos, product and service names, designs, and slogans on this Platform are the trademarks of their respective owners.</p>
      <p class="mb-4">If you believe that any content on the Platform infringes upon your copyright, please notify us immediately with detailed information, including a description of the copyrighted work, the location of the infringing material on our Platform, and your contact information. We will investigate all claims of copyright infringement and take appropriate action.</p>
      <p class="mb-4">By submitting any content (e.g., reviews, comments, service descriptions) to the Platform, you grant HandyGo a worldwide, non-exclusive, royalty-free, perpetual, irrevocable, and sublicensable license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content in any media. You represent and warrant that you own or control all rights to the content you submit.</p>
    `
  },
  {
    id: 6,
    title: "Disclaimers and Limitation of Liability",
    content: `
      <p class="mb-4">THE PLATFORM AND ITS SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE. HANDYGO DOES NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR THAT ANY DEFECTS WILL BE CORRECTED.</p>
      <p class="mb-4">IN NO EVENT SHALL HANDYGO, NOR ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE PLATFORM; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE PLATFORM; (III) ANY CONTENT OBTAINED FROM THE PLATFORM; AND (IV) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE, AND EVEN IF A REMEDY SET FORTH HEREIN IS FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE.</p>
      <p class="mb-4">Some jurisdictions do not allow the exclusion of certain warranties or the exclusion or limitation of liability for consequential or incidental damages, so the limitations above may not apply to you. In such cases, HandyGo's liability will be limited to the fullest extent permitted by applicable law.</p>
      <p class="mb-4">You acknowledge that HandyGo is a platform that connects customers with service providers, and we do not directly provide the services listed on the Platform. We are not responsible for the quality, safety, or legality of the services advertised, the truth or accuracy of the listings, or the ability of service providers to deliver services or customers to pay for services. Any disputes between users must be resolved directly between them.</p>
      <p class="mb-4">Your use of the Platform is at your sole risk. You are responsible for evaluating the accuracy, completeness, and usefulness of all opinions, advice, services, and other information provided through the Platform. We strongly advise you to conduct your own due diligence before engaging in any transactions or interactions with other users.</p>
    `
  },
  {
    id: 7,
    title: "Termination",
    content: `
      <p class="mb-4">We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms. This includes, but is not limited to, violations of our acceptable use policy, fraudulent activities, or any conduct that harms the integrity or reputation of HandyGo or its users.</p>
      <p class="mb-4">Upon termination, your right to use the service will immediately cease. If you wish to terminate your account, you may simply discontinue using the service or contact us to request account deletion. Please note that some of your data may be retained for a certain period after termination as required by law or for legitimate business purposes, such as record-keeping and dispute resolution.</p>
      <p class="mb-4">All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability. Termination of your account does not relieve you of any obligations incurred prior to termination, including payment obligations.</p>
      <p class="mb-4">We reserve the right to investigate any suspected violations of these Terms. If we determine, in our sole discretion, that a violation has occurred, we may take various actions, including issuing a warning, suspending or terminating your account, removing content, or pursuing legal remedies. Our decision to terminate an account is final and binding.</p>
      <p class="mb-4">You understand that termination of your account may involve deletion of your user content associated with your account from our live databases. HandyGo will not have any liability whatsoever to you for any termination of your rights under these Terms, including for deletion of your user content.</p>
    `
  },
  {
    id: 8,
    title: "Governing Law and Dispute Resolution",
    content: `
      <p class="mb-4">These Terms shall be governed and construed in accordance with the laws of the Republic of the Philippines, without regard to its conflict of law provisions. You agree that any legal action or proceeding between HandyGo and you for any purpose concerning these Terms or the parties' obligations hereunder shall be brought exclusively in a federal or state court of competent jurisdiction sitting in the Philippines.</p>
      <p class="mb-4">Any dispute arising out of or relating to these Terms, or your use of the Platform, shall first be attempted to be resolved through good faith negotiations between the parties. If the dispute cannot be resolved through negotiation within a reasonable period, the parties agree to consider mediation as a next step. If mediation is unsuccessful, the dispute shall be submitted to binding arbitration in accordance with the rules of a recognized arbitration body in the Philippines.</p>
      <p class="mb-4">The arbitration shall be conducted by a single arbitrator, mutually agreed upon by the parties. The decision of the arbitrator shall be final and binding upon both parties. The costs of arbitration, including the arbitrator's fees, shall be shared equally by the parties, unless otherwise determined by the arbitrator. This clause is intended to provide an efficient and cost-effective means of resolving disputes.</p>
      <p class="mb-4">You agree that, by entering into these Terms, you and HandyGo are each waiving the right to a trial by jury or to participate in a class action. All claims must be brought in the parties' individual capacity, and not as a plaintiff or class member in any purported class or representative proceeding.</p>
      <p class="mb-4">This governing law and dispute resolution clause is crucial for ensuring that any legal matters are handled under a clear and consistent legal framework, providing predictability and fairness for both users and HandyGo. We aim to resolve all issues amicably, but this framework ensures a clear path for resolution if necessary.</p>
    `
  },
  {
    id: 9,
    title: "Changes to Terms and Platform",
    content: `
      <p class="mb-4">We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Platform after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Platform.</p>
      <p class="mb-4">HandyGo also reserves the right to modify, suspend, or discontinue, temporarily or permanently, the Platform or any part of it, with or without notice, at any time. You agree that HandyGo shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the Platform.</p>
      <p class="mb-4">We continuously strive to improve our services and may introduce new features, functionalities, or changes to existing ones. These updates are designed to enhance your experience and the overall quality of the Platform. We encourage you to regularly check for updates to these Terms and to the Platform itself.</p>
      <p class="mb-4">Notifications of changes may be provided through various means, including posting the updated Terms on the Platform, sending email notifications, or through in-app messages. It is your responsibility to ensure that your contact information is up-to-date to receive such notifications.</p>
      <p class="mb-4">Your continued use of the Platform after any changes to the Terms or the Platform itself indicates your acceptance of those changes. If you have any concerns about upcoming changes, please feel free to contact our support team for clarification.</p>
    `
  },
  {
    id: 10,
    title: "Miscellaneous Provisions and Contact Information",
    content: `
      <p class="mb-4"><strong>Entire Agreement:</strong> These Terms, together with the Privacy Policy and any other legal notices published by HandyGo on the Platform, constitute the entire agreement between you and HandyGo concerning the Platform. They supersede all prior or contemporaneous communications and proposals, whether oral, written, or electronic, between you and HandyGo with respect to the Platform.</p>
      <p class="mb-4"><strong>Severability:</strong> If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. The invalid or unenforceable provision shall be replaced by a valid and enforceable provision that most closely matches the intent of the original provision.</p>
      <p class="mb-4"><strong>Waiver:</strong> No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term, and HandyGo's failure to assert any right or provision under these Terms shall not constitute a waiver of such right or provision.</p>
      <p class="mb-4"><strong>Assignment:</strong> These Terms, and any rights and licenses granted hereunder, may not be transferred or assigned by you, but may be assigned by HandyGo without restriction. Any attempted transfer or assignment in violation hereof shall be null and void.</p>
      <p class="mb-4"><strong>Force Majeure:</strong> HandyGo shall not be liable for any failure to perform its obligations hereunder where such failure results from any cause beyond HandyGo's reasonable control, including, without limitation, mechanical, electronic, or communications failure or degradation.</p>
      <p class="mb-4"><strong>Headings:</strong> The headings used in these Terms are for convenience only and shall not affect the interpretation of these Terms.</p>
      <p class="mb-4"><strong>Contact Us:</strong> If you have any questions about these Terms, please contact us:</p>
      <ul class="list-disc list-inside ml-4 mb-4">
        <li>By email: <a href="mailto:support@handygo.com" class="text-sky-500 hover:underline">support@handygo.com</a></li>
        <li>By visiting this page on our website: <a href="#" class="text-sky-500 hover:underline">www.handygo.com/contact</a></li>
      </ul>
      <p class="mb-4">We appreciate your understanding and cooperation in adhering to these Terms. Our aim is to provide a secure, efficient, and fair platform for everyone. Your feedback is always welcome as we continuously strive to improve our services and policies.</p>
    `
  }
]

function TermsCondition({ onClose }: TermsConditionProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [modalVisible, setModalVisible] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    setModalVisible(true)
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  const handleCloseModal = (accepted: boolean) => {
    if (accepted) {
      setModalVisible(false)
      setTimeout(() => {
        setShowSuccessModal(true)
      }, 300)
      setTimeout(() => {
        setShowSuccessModal(false)
        onClose(accepted)
      }, 3000)
    } else {
      setModalVisible(false)
      setTimeout(() => {
        onClose(accepted)
      }, 300)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500"
        style={{ opacity: modalVisible ? 1 : 0 }}
        onClick={() => handleCloseModal(false)}
      />

      <div
        className="relative bg-white w-full h-full flex flex-col transition-all duration-500 transform"
        style={{
          opacity: modalVisible ? 1 : 0,
          transform: modalVisible ? "scale(1)" : "scale(0.98)",
        }}
      >
        <button
          onClick={() => handleCloseModal(false)}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 z-20 transition-colors"
          aria-label="Close terms and conditions"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center justify-center py-8 border-b border-gray-200">
          <h1 className="text-3xl font-semibold text-gray-800">
            Terms and Services & Privacy Policy
          </h1>
          <p className="text-gray-500 mt-2">Please review all sections before accepting</p>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <nav className="p-6 space-y-1">
              {termsContent.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(index)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 group ${
                    currentSection === index
                      ? "bg-sky-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <span
                        className={`text-sm font-medium ${
                          currentSection === index ? "text-white" : "text-gray-400"
                        }`}
                      >
                        {section.id}
                      </span>
                      <span className="text-sm font-medium leading-tight">
                        {section.title}
                      </span>
                    </div>
                    <ChevronRight
                      size={18}
                      className={`transition-transform duration-300 ${
                        currentSection === index
                          ? "translate-x-1 text-white"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-12 py-8">
              <div
                key={currentSection}
                className="animate-fadeIn"
                style={{
                  animation: "fadeIn 0.4s ease-in-out"
                }}
              >
                <div className="max-w-4xl">
                  <div className="mb-6">
                    <span className="text-sky-500 text-sm font-semibold">
                      Section {termsContent[currentSection].id}
                    </span>
                    <h2 className="text-3xl font-semibold text-gray-800 mt-2">
                      {termsContent[currentSection].title}
                    </h2>
                  </div>
                  <div
                    className="text-gray-700 leading-relaxed text-base prose prose-sky max-w-none"
                    dangerouslySetInnerHTML={{ __html: termsContent[currentSection].content }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-12 py-6 bg-white">
              <div className="flex justify-between items-center max-w-4xl">
                <button
                  onClick={() => handleCloseModal(true)}
                  className="px-6 py-2.5 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Skip & Accept
                </button>

                <div className="flex gap-3">
                  {currentSection < termsContent.length - 1 ? (
                    <button
                      onClick={() => setCurrentSection(currentSection + 1)}
                      className="px-8 py-2.5 rounded-lg font-medium transition-all bg-sky-500 text-white hover:bg-sky-600 shadow-sm hover:shadow-md"
                    >
                      Next Section
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleCloseModal(false)}
                        className="px-6 py-2.5 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleCloseModal(true)}
                        className="px-8 py-2.5 rounded-lg font-medium transition-all bg-sky-500 text-white hover:bg-sky-600 shadow-sm hover:shadow-md"
                      >
                        Accept Terms
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-[60] flex items-center justify-center p-4"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <div
            className="mx-auto max-w-md w-full bg-white rounded-3xl overflow-hidden transform transition-all border border-white/20 p-6"
            style={{ animation: "fadeIn 0.5s ease-out" }}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
                style={{ animation: "pulse 2s ease-in-out infinite" }}
              >
                <CheckCircle2
                  className="h-10 w-10 text-green-500"
                  style={{ animation: "bounceIn 0.6s ease-out" }}
                />
              </div>

              <h3
                className="text-xl font-medium text-gray-800 mb-2"
                style={{ animation: "slideInUp 0.4s ease-out" }}
              >
                Terms Accepted!
              </h3>

              <p
                className="text-gray-600 mb-6 text-sm leading-relaxed"
                style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}
              >
                Thank you for accepting our Terms and Services. You can now continue using HandyGo.
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in-out;
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @keyframes bounceIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default TermsCondition