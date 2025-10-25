import { useState, useEffect } from "react"
import { X, ChevronRight, CheckCircle2 } from "lucide-react"

import proposition1 from "@/assets/Terms/worker4.mp4"
import proposition2 from "@/assets/Terms/10.jpg"
import proposition3 from "@/assets/Terms/1.jpg"
import about1 from '@/assets/Terms/21.jpg'
import about2 from '@/assets/Terms/23.jpg'
import about3 from '@/assets/Terms/27.jpeg'
import about4 from '@/assets/Terms/29.jpg'
import img1 from "../../assets/Terms/30.jpg"
import img2 from "../../assets/Terms/31.jpg"
import img3 from "../../assets/Terms/32.jpg"
import img4 from "../../assets/Terms/33.png"
import img5 from "../../assets/Terms/34.jpg"
import img6 from "../../assets/Terms/35.jpg"
import img7 from "../../assets/Terms/38.jpg"
import img8 from "@/assets/Home/dec1.jpg"
import img9 from "@/assets/Login/20210423103706.jpg"
import img10 from "@/assets/Login/6.jpg"

interface TermsConditionProps {
  onClose: (accepted: boolean) => void
}

const termsContent = [
  {
    id: 1,
    title: "Introduction and Acceptance of Terms",
    content: `
      <p class="mb-4 text-gray-700">Welcome to HandyGo! These Terms of Service (“Terms”) govern your access to and use of the HandyGo website and related services (collectively, the “Platform”). By accessing or using the Platform, you signify that you have read, understood, and agree to be bound by these Terms, whether or not you are a registered user of our Platform. If you do not agree with these Terms, you must not use or access the Platform.</p>

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

      <p class="mb-4">We collect various types of information, including personal data (such as your name, email address, contact number, and payment information), usage data (such as IP addresses, browser types, and access times), and information related to your interactions with the Platform. This data is used to provide, maintain, and improve our services, process transactions, communicate with you, and ensure the security and integrity of our Platform.</p>
      <p class="mb-4">We implement strong security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Passwords are protected using encrypted hashing algorithms, including MD5, SHA1, SHA256, and SHA512. All stored data is securely maintained within encrypted cloud storage solutions, including MongoDB and Vercel Blob. While we take extensive precautions to safeguard your information, please note that no method of transmission over the Internet or electronic storage is completely secure, and absolute security cannot be guaranteed.</p>


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

     <p class="mb-4">Any breach of this provision may result in immediate termination of your account, reporting to relevant law enforcement authorities, and legal action. We reserve the right to monitor user activity and content to ensure compliance with these Terms and to protect the safety and security of our community. In cases where users are verified victims of scams or fraudulent activity conducted through or related to the Platform, HandyGo may issue refund coupons as compensation, with the discount amount determined based on the total verified amount lost.</p>


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
    title: "Payment Policy",
    content: `
    <p class="mb-4">All payments made through the HandyGo Platform are processed securely via <strong>PayMongo</strong>, our authorized third-party payment gateway. By proceeding with any payment, you acknowledge and agree that HandyGo does not directly collect or store your payment details, and that all transactions are subject to PayMongo’s terms and conditions.</p>

    <p class="mb-4">In the event that a payment is not received, delayed, or otherwise disrupted due to issues within PayMongo’s system, HandyGo shall not be held responsible, as such matters fall outside our control. However, in cases of miscalculations or overcharges caused by our system or internal processing errors, please submit a ticket through our report system. Our support team will review the case and take the necessary steps to resolve the issue promptly.</p>

    <p class="mb-4">All total payment amounts displayed on the Platform are considered <strong>preliminary estimates</strong> and may be subject to change based on actual on-site conditions, damages, or other factors agreed upon between the customer and HandyGo employees. Final charges will be confirmed only after the completion of the service.</p>

    <p class="mb-4">By using the Platform and completing a payment, you agree to this Payment Policy and acknowledge that HandyGo’s role is limited to facilitating transactions through PayMongo, without direct control over the payment processing or settlement timeline.</p>
  `
  },
  {
    id: 7,
    title: "Booking Cancellation Policy",
    content: `
      <p class="mb-4">In the event of a booking cancellation after acceptance by the Chief Operating Officer (COO), any payment or deposit made is generally non-refundable unless the assigned employee fails to complete the agreed service. If no deposit (“DP”) has been made, no refund will be issued.</p>

      <p class="mb-4">If the company fails to respond or fulfill its obligations without valid reason after a booking has been accepted, it will be subject to internal review and appropriate disciplinary actions. Users or entities found engaging in scam-related activities will be permanently banned from the Platform, and their documentation will remain blacklisted in our system.</p>

      <p class="mb-4">In verified cases where a customer is targeted or affected by a scam related to the Platform, HandyGo may provide refund coupons as compensation. The value of such coupons will depend on the total verified amount lost, as determined by our support team after investigation.</p>

      <p class="mb-4">This policy ensures fairness and accountability between customers, employees, and the company. All cancellations and refund-related concerns must be reported through our official report system so that our team can review and address them appropriately.</p>
    `
  },
  {
    id: 8,
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
    id: 9,
    title: "Copyright and Image Credits",
    content: `
    <p class="mb-4"><strong>Copyright and Image Credits:</strong> All images displayed on the Platform are the copyright of their respective owners. HandyGo provides a full list of images used, along with links and credits to the original creators. Users are encouraged to review Sections 1 through 8 carefully; this should not take much time but is important for understanding your rights and obligations.</p>

    <h3 class="mb-[-60px] text-sky-500">Proposition Page</h3>

    <div class="flex flex-col">
        <video class="inline w-full mr-2 mt-20" controls pause>
          <source src="${proposition1}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
 
        <strong class="mt-2">Credit:</strong> <a href=" https://www.pexels.com/video/a-day-at-the-mall-1338598" target="_blank">Richarles Moral</a>
    </div>
    
    <div class="flex flex-col">
      <img src="${proposition2}" class="inline w-full h-full mr-2"/>  
 
        <strong class="mt-2">Credit:</strong> <a href="https://www.bworldonline.com/banking-finance/2025/03/17/659539/paymongo-could-raise-fresh-capital-early-next-year/" target="_blank">BusinessWorld</a>
    </div>

     <div class="flex flex-col">
      <img src="${proposition3}" class="inline w-full h-100 mr-2"/>  
 
        <strong class="mt-2">Credit:</strong> <a href="https://www.bworldonline.com/banking-finance/2025/03/17/659539/paymongo-could-raise-fresh-capital-early-next-year/" target="_blank">The Borgen Project</a>
    </div>

     <div class="flex flex-col">
      <img src="${about1}" class="inline w-full h-100 mr-2"/>  
 
        <strong class="mt-2">Credit:</strong> <a href="https://philippinesesim.com/use-cell-phone/" target="_blank">philippinesesim</a>
    </div>

    <div class="flex flex-col">
      <img src="${about2}" class="inline w-full h-100 mr-2"/>  
 
        <strong class="mt-2">Credit:</strong> <a href="https://www.lalamove.com/en-ph/newsroom/betis-furnituremakers-success-path" target="_blank">LalaMove</a>
    </div>

     <div class="flex flex-col">
      <img src="${about3}" class="inline w-full h-100 mr-2"/>  
 
        <strong class="mt-2">Credit:</strong> <a href="https://hir.harvard.edu/overseas-filipino-workers-the-modern-day-heroes-of-the-philippines/ " target="_blank">Harvard Edu</a>
    </div>

     <div class="flex flex-col">
      <img src="${about4}" class="inline w-full h-100 mr-2"/>  
 
        <strong class="mt-2">Credit:</strong> <a href="https://www.bworldonline.com/top-stories/2023/04/14/516613/filipino-workers-need-270-years-to-earn-1m/ " target="_blank">BusinessWorld</a>
    </div>

      <div class="flex flex-col">
      <img src="${img1}" class="inline w-full h-100 mr-2"/>  
 
        <strong class="mt-2">Credit:</strong> <a href="https://www.wat-aire.com/services/plumbing-services-metro-manila/ " target="_blank">WAT-AIR TRADING</a>
    </div>

      <div class="flex flex-col">
      <img src="${img2}" class="inline w-full h-100 mr-2"/>  
 
        <strong class="mt-2">Credit:</strong> <a href="https://www.adobomagazine.com/philippine-news/brand-business-two-months-after-odette-brigadangayala-helps-over-500-families-rebuild-their-homes/ " target="_blank">AdoboMagazine</a>
    </div>

      <div class="flex flex-col">
      <img src="${img3}" class="inline w-full h-100 mr-2"/>  
 
        <strong class="mt-2">Credit:</strong> <a href="https://ensun.io/search/hvac/philippines " target="_blank">Ensun</a>
    </div>

      <div class="flex flex-col">
      <img src="${img4}" class="inline w-full h-100 mr-2"/>  
 
        <strong class="mt-2">Credit:</strong> <a href="https://farmlandgrab.org/post/31730-philippines-kalap-s-agribusiness-ecosystem-is-a-system-of-dispossessing-farmers-and-abusing-agri-workers-uma " target="_blank">FarmLand</a>
    </div>

      <div class="flex flex-col">
      <img src="${img5}" class="inline w-full h-100 mr-2"/>  
 
        <strong class="mt-2">Credit:</strong> <a href="https://southfumigation.com.ph/ " target="_blank">SouthFumigation</a>
    </div>

      <div class="flex flex-col">
      <img src="${img6}" class="inline w-full h-100 mr-2"/>  
 
        <strong class="mt-2">Credit:</strong> <a href="https://asia.nikkei.com/location/east-asia/japan/filipino-housekeepers-japan-dream " target="_blank">Asia Nikkie</a>
    </div>

      <div class="flex flex-col">
      <img src="${img7}" class="inline w-full h-100 mr-2"/>  
 
        <strong class="mt-2">Credit:</strong> <a href="https://metronewscentral.net/lifestyle/62-of-filipino-workers-use-ai-at-work-mdashsurvey " target="_blank">Metro News Central</a>
    </div>

    <h3 class="mt-10 mb-10 text-sky-500">Login Page</h3>

    <div class="flex flex-col">
      <img src="${img8}" class="inline w-full h-100 mr-2"/>  
 
        <strong class="mt-2">Credit:</strong> <a href="https://metronewscentral.net/lifestyle/62-of-filipino-workers-use-ai-at-work-mdashsurvey " target="_blank">Cengo</a>
    </div>

    <div class="flex flex-col">
      <img src="${img9}" class="inline w-full h-100 mr-2"/>  
 
        <strong class="mt-2">Credit:</strong> <a href="https://metronewscentral.net/lifestyle/62-of-filipino-workers-use-ai-at-work-mdashsurvey " target="_blank">Visayan Electric Company</a>
    </div>

    <div class="flex flex-col">
      <img src="${img10}" class="inline w-full h-100 mr-2"/>  
 
        <strong class="mt-2">Credit:</strong> <a href="https://metronewscentral.net/lifestyle/62-of-filipino-workers-use-ai-at-work-mdashsurvey " target="_blank">Massage</a>
    </div>

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
          <h1 className="text-3xl font-medium text-gray-800">
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
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 group ${currentSection === index
                    ? "bg-sky-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <span
                        className={`text-sm font-medium ${currentSection === index ? "text-white" : "text-gray-400"
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
                      className={`transition-transform duration-300 ${currentSection === index
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