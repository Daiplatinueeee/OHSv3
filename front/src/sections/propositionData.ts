import { LayoutDashboard, UploadCloud, ShieldCheck, Tag, CloudUpload, Brain } from 'lucide-react';

import customer1 from '../assets/default-avatar-profile-icon-social-600nw-1913928688.png';
import customerbg1 from '../assets/proposition/team photo/jv.jpg';

import customer2 from '../assets/default-avatar-profile-icon-social-600nw-1913928688.png';
import customerbg2 from '../assets/proposition/team photo/kath.jpg';

import customer3  from '../assets/default-avatar-profile-icon-social-600nw-1913928688.png';
import customerbg3 from '../assets/proposition/team photo/kc.jpg';

import customer4 from '../assets/default-avatar-profile-icon-social-600nw-1913928688.png';
import customerbg4 from '../assets/proposition/team photo/waris.jpg';

import customer5 from '../assets/default-avatar-profile-icon-social-600nw-1913928688.png';
import customerbg5 from '../assets/proposition/team photo/kyle.jpg';

import customer6  from '../assets/default-avatar-profile-icon-social-600nw-1913928688.png';
import customerbg6 from '../assets/Terms/20.jpg';

import about1 from '../assets/Terms/21.jpg';
import about2 from '../assets/Terms/23.jpg';
import about3 from '../assets/Terms/27.jpeg';
import about4 from '../assets/Terms/29.jpg';

import benifit1 from '../assets/Terms/17.png';
import benifit2 from '../assets/Terms/19.png';
import benifit3 from '../assets/Terms/11.jpg';
import benifit4 from '../assets/Terms/10.jpg';
import benifit5 from '../assets/Terms/12.jpg';
import benifit6 from '../assets/Terms/1.jpg';

export interface Benefit {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    image: string;
}

export const benefits: Benefit[] = [
    {
        id: 1,
        title: "Simplified Booking",
        subtitle: "Fast & Effortless",
        description: "Our two-step booking process makes it easy to connect with trusted professionals. Quick, smooth, and stress-free.",
        image: benifit1
    },

    {
        id: 2,
        title: "Balanced Marketing Tone",
        subtitle: "Trusted Service",
        description: "We work with verified professionals committed to delivering trustworthy and dependable service you can rely on.",
        image: benifit2
    },
    {
        id: 3,
        title: "Real-time Tracking",
        subtitle: "Stay Updated",
        description: "Track your service provider's location and estimated arrival time in real-time. Never wonder when help will arrive.",
        image: benifit3
    },
    {
        id: 4,
        title: "Payment Integration",
        subtitle: "Powered by PayMongo",
        description: "Experience safe and reliable transactions through PayMongo’s trusted payment gateway, ensuring every payment is protected and hassle-free.",
        image: benifit4
    },
    {
        id: 6,
        title: "Dedicated Support",
        subtitle: "Friendly & Responsive",
        description: "Enjoy a smooth experience with our attentive customer support, always ready to help during service hours.",
        image: benifit5
    },
    {
        id: 5,
        title: "Quality Guarantee",
        subtitle: "Satisfaction Assured",
        description: "We guarantee the quality of our services. If you're not satisfied, we'll make it right or refund your money.",
        image: benifit6
    }
];

export const tweets = [
    {
        avatar: customer1,
        name: "josh",
        handle: "@josh",
        verified: true,
        content: "Just had my electrical wiring checked by HandyGo! Super quick and the technician explained everything clearly. Feeling much safer now. Highly recommend their efficiency! ⚡",
        image: customerbg1,
        stats: {
            comments: 12,
            retweets: 24,
            likes: 483,
            views: "1.2M"
        }
    },
    {
        avatar: customer2,
        name: "kath",
        handle: "@kath",
        verified: true,
        content: "Just used HandyGo for a plumbing repair – absolutely blown away by their professionalism and attention to detail! The technician was super efficient. Highly recommend! 🌟",
        image: customerbg2,
        stats: {
            comments: 8,
            retweets: 15,
            likes: 234,
            views: "856K"
        }
    },
    {
        avatar: customer3,
        name: "kim",
        handle: "@kim",
        verified: true,
        content: "After trying multiple service platforms, HandyGo stands out for their reliability and quality. Their team is responsive, professional, and delivers exceptional results every time! 💯",
        image: customerbg3,
        stats: {
            comments: 15,
            retweets: 42,
            likes: 567,
            views: "1.5M"
        }
    },
    {
        avatar: customer4,
        name: "waris",
        handle: "@waris",
        verified: true,
        content: "I'm amazed by the quality and efficiency of HandyGo for my appliance repair! Fixed an emergency issue in under an hour. Their technicians are true professionals. Will definitely be using them again! 🔧",
        image: customerbg4,
        stats: {
            comments: 18,
            retweets: 31,
            likes: 429,
            views: "952K"
        }
    },
    {
        avatar: customer5,
        name: "kyle",
        handle: "@kyle",
        verified: true,
        content: "The HandyGo cleaning team transformed our home into a paradise! Their attention to detail and thoroughness exceeded all expectations. Worth every penny for the incredible results. 🌿",
        image: customerbg5,
        stats: {
            comments: 24,
            retweets: 56,
            likes: 682,
            views: "1.8M"
        }
    },
    {
        avatar: customer6,
        name: "eduward",
        handle: "@eduward",
        verified: true,
        content: "Hired HandyGo for a complete AC inspection and tune-up. Their team was thorough, professional, and completed the work ahead of schedule! No more worries during the hot season. Couldn't be happier with the service! ❄️",
        image: customerbg6,
        stats: {
            comments: 11,
            retweets: 19,
            likes: 301,
            views: "783K"
        }
    }
];

export const services = [
    { title: "PLUMBLING", section: "01", action: "DISCOVER" },
    { title: "HANDYMAN", section: "02", action: "EXPLORE" },
    { title: "LANDSCAPING", section: "03", action: "EXPERIENCE" },
    { title: "ROOFING", section: "04", action: "LEARN" },
    { title: "PEST CONTROL", section: "05", action: "JOIN" },
    { title: "CLEANING", section: "06", action: "VISIT" }
];

export const aboutHandyGo = [
    {
        id: 1,
        title: "CONVENIENCE AT YOUR FINGERTIPS",
        subtitle: "INSTANT ACCESS",
        description: "The name 'HandyGo' embodies our core mission: to provide production services that are both accessible and mobile. We're always ready to spring into action, bringing convenience to your fingertips.",
        image: about1,
        bgColor: "bg-amber-50",
        accentColor: "text-amber-600"
    },
    {
        id: 2,
        title: "EFFICIENCY IN MOTION",
        subtitle: "SWIFT SERVICE",
        description: "HandyGo represents our commitment to efficiency. Just like our name suggests, we're quick, agile, and always on the move to ensure your production runs smoothly from start to finish.",
        image: about2,
        bgColor: "bg-gray-200",
        accentColor: "text-emerald-500"
    },
    {
        id: 3,
        title: "READY WHEN YOU ARE",
        subtitle: "24/7 AVAILABILITY",
        description: "The 'Go' in HandyGo signifies our readiness. We're prepared to mobilize at a moment's notice, adapting to your production needs regardless of timeline or complexity.",
        image: about3,
        bgColor: "bg-sky-50",
        accentColor: "text-sky-500"
    },
    {
        id: 4,
        title: "SIMPLICITY IN COMPLEXITY",
        subtitle: "SEAMLESS SOLUTIONS",
        description: "Our name reflects our approach to production challenges. We take complex production requirements and make them handy – simple, manageable, and achievable.",
        image: about4,
        bgColor: "bg-pink-50",
        accentColor: "text-pink-500"
    }
];

export const sponsorLogos = [
    {
        name: "Amazon",
        image: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
    },
    {
        name: "DeebSeek",
        image: "https://upload.wikimedia.org/wikipedia/commons/e/ec/DeepSeek_logo.svg"
    },
    {
        name: "Lazada",
        image: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Lazada_%282019%29.svg"
    },
    {
        name: "Google",
        image: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Google_logo_%282013-2015%29.svg"
    },
    {
        name: "Youtube",
        image: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Logo_of_YouTube_%282015-2017%29.svg"
    },
    {
        name: "Facebook",
        image: "https://upload.wikimedia.org/wikipedia/commons/9/93/Facebook_logo_%282023%29.svg"
    },
    {
        name: "GitHub",
        image: "https://upload.wikimedia.org/wikipedia/commons/2/29/GitHub_logo_2013.svg"
    },
    {
        name: "CloudBees",
        image: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Cloudbees-logo-black.png"
    },
    {
        name: "Yes Bank",
        image: "https://upload.wikimedia.org/wikipedia/commons/4/4d/RIT_2018_logo_Image_Permanence_Institute_hor_k.svg"
    },
    {
        name: "Polyga",
        image: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Polyga-logo-color-small.png"
    },
    {
        name: "LinkedIn",
        image: "https://upload.wikimedia.org/wikipedia/commons/b/b1/LinkedIn_Logo_2013_%282%29.svg"
    },
    {
        name: "ZAP by Checkmarx",
        image: "https://upload.wikimedia.org/wikipedia/commons/8/87/Logo_of_ZAP_by_Checkmarx.svg"
    },
    {
        name: "Microsoft",
        image: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg"
    },
    {
        name: "WildBrain",
        image: "https://upload.wikimedia.org/wikipedia/commons/b/be/WildBrain_logo.svg"
    },
    {
        name: "New Relic",
        image: "https://upload.wikimedia.org/wikipedia/commons/2/2b/New_Relic_logo.png"
    }
];

export const sponsorQuote = {
    text: "These incredible partners and sponsors have made invaluable contributions to building and maintaining our robust service platform. Their support enables us to deliver exceptional quality and innovation to our customers.",
    author: "HandyGo Team",
    role: "Development & Management"
};

export const systemFeatures = [
  {
    icon: LayoutDashboard,
    title: "Floating Dock Navigation",
    description:
      "A modern and unique navigation system that replaces the usual navbar and sidebar. Giving users a cleaner, more intuitive interface.",
    video:
      "https://cdn.pixabay.com/vimeo/479559144/UI%20-%2047941.mp4?width=640&hash=abc123def456ghi789",
  },
  {
    icon: UploadCloud,
    title: "Bulk Provider Upload",
    description:
      "Add multiple service providers at once with our hassle-free bulk upload feature. Saving time and improving company efficiency.",
    video:
      "https://cdn.pixabay.com/vimeo/484017267/Data%20Upload%20-%2048401.mp4?width=640&hash=xyz987654321abc",
  },
  {
    icon: ShieldCheck,
    title: "reCAPTCHA Protection",
    description:
      "Powered by Google reCAPTCHA for enhanced system security. Keeping the platform safe from spam, bots, and unauthorized activity.",
    video:
      "https://cdn.pixabay.com/vimeo/529533910/Digital%20Security%20-%2068318.mp4?width=640&hash=a1b2c3d4e5f6g7h8i9j0k",
  },
  {
    icon: Tag,
    title: "Discount Coupons",
    description:
      "Engage users with exclusive coupon codes for discounts and special offers. Making every booking more rewarding.",
    video:
      "https://cdn.pixabay.com/vimeo/527438842/Promo%20-%2067087.mp4?width=640&hash=promo123hash456",
  },
  {
    icon: CloudUpload,
    title: "Blob & Vercel Storage",
    description:
      "Integrated with Vercel Blob for secure, efficient image uploading and online storage. Ensuring smooth media management.",
    video:
      "https://cdn.pixabay.com/vimeo/527438875/Database%20-%2067088.mp4?width=640&hash=storagehash999",
  },
  {
    icon: Brain,
    title: "AI-Powered Assistance",
    description:
      "Built with DeepSeek R1 for advanced AI integration. Offering intelligent insights, automation, and a smarter user experience.",
    video:
      "https://cdn.pixabay.com/vimeo/480626496/Artificial%20Intelligence%20-%2048166.mp4?width=640&hash=ai123deep456seek",
  },
];