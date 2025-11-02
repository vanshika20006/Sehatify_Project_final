import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Wave Background */}
      <div className="relative">
        {/* Top wave */}
        <svg 
          className="absolute top-0 left-0 w-full h-10 -translate-y-1 z-10"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            className="fill-current text-purple-600"
          />
        </svg>
        
        {/* Main gradient background */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-orange-500 pt-20">
          {/* Bottom wave overlay */}
          <svg 
            className="absolute bottom-0 left-0 w-full h-24 z-10"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,0V7.23C0,65.52,268.63,112.77,600,112.77S1200,65.52,1200,7.23V0Z" 
              className="fill-current text-orange-500 opacity-30"
            />
          </svg>
          
          {/* Content */}
          <div className="relative z-20 max-w-7xl mx-auto px-4 py-16 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Health Services Column */}
              <div>
                <h3 className="text-lg font-semibold mb-6">Health</h3>
                <ul className="space-y-3">
                  <li><Link href="/medicines" className="text-gray-100 hover:text-white transition-colors text-sm">Book Medicines</Link></li>
                  <li><Link href="/doctors" className="text-gray-100 hover:text-white transition-colors text-sm">Doctor Consultation</Link></li>
                  <li><Link href="/vitals" className="text-gray-100 hover:text-white transition-colors text-sm">Book a Lab test</Link></li>
                  <li><Link href="/partnership" className="text-gray-100 hover:text-white transition-colors text-sm">Partner with Sehatify</Link></li>
                  <li><Link href="/hospitalization" className="text-gray-100 hover:text-white transition-colors text-sm">Hospitalization</Link></li>
                  <li><Link href="/locate-hospital" className="text-gray-100 hover:text-white transition-colors text-sm">Locate hospital</Link></li>
                </ul>
              </div>

              {/* About Column */}
              <div>
                <h3 className="text-lg font-semibold mb-6">ABOUT</h3>
                <ul className="space-y-3">
                  <li><Link href="/overview" className="text-gray-100 hover:text-white transition-colors text-sm">Overview</Link></li>
                  <li><Link href="/blog" className="text-gray-100 hover:text-white transition-colors text-sm">Blog</Link></li>
                  <li><Link href="/beliefs" className="text-gray-100 hover:text-white transition-colors text-sm">Sehatify Beliefs</Link></li>
                  <li><Link href="/faqs" className="text-gray-100 hover:text-white transition-colors text-sm">FAQs</Link></li>
                </ul>
              </div>

              {/* Our Policies Column */}
              <div>
                <h3 className="text-lg font-semibold mb-6">Our Policies</h3>
                <ul className="space-y-3">
                  <li><Link href="/terms" className="text-gray-100 hover:text-white transition-colors text-sm">Terms of Use</Link></li>
                  <li><Link href="/privacy" className="text-gray-100 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
                  <li><Link href="/grievance" className="text-gray-100 hover:text-white transition-colors text-sm">Grievance Redressal</Link></li>
                </ul>
              </div>

              {/* Logo Column - Rightmost */}
              <div className="flex justify-end items-start">
                <div className="flex flex-col items-center space-y-0">
                  <img 
                    src="/sehatify-logo.png" 
                    alt="Sehatify Logo" 
                    className="w-80 h-80 object-contain"
                  />
                  {/* <span className="text-white text-lg font-semibold">Sehatify</span> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}