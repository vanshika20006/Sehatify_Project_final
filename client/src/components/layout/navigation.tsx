import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Menu, X, Users, UserCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navigation() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      {/* Container is now full-width with padding on the sides */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Sehatify Style */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-3">
              {/* Sehatify logo with adjusted size for better fit */}
              <img
                src="/sehatify-logo.png"
                alt="Sehatify Logo"
                className="h-24 w-auto object-contain" // Adjusted logo size
              />
              <span className="text-xl font-semibold text-gray-800">Sehatify</span>
            </div>
          </Link>

          {/* Desktop Navigation - Clean Sehatify Style */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/doctors" className={`text-gray-600 hover:text-purple-600 font-medium transition-colors text-sm ${location === '/doctors' ? 'text-purple-600' : ''}`}>
              Talk to Doctor
            </Link>
            <Link href="/medicines" className={`text-gray-600 hover:text-purple-600 font-medium transition-colors text-sm ${location === '/medicines' ? 'text-purple-600' : ''}`}>
              Medicines
            </Link>
            <Link href="/lab-tests" className={`text-gray-600 hover:text-purple-600 font-medium transition-colors text-sm ${location === '/lab-tests' ? 'text-purple-600' : ''}`}>
              Lab Test &
              Diagnostic
            </Link>
            <Link href="/ai-doctor" className={`text-gray-600 hover:text-purple-600 font-medium transition-colors text-sm ${location === '/ai-doctor' ? 'text-purple-600' : ''}`}>
              AI Doctor
            </Link>
            <Link href="/mental-health" className={`text-gray-600 hover:text-purple-600 font-medium transition-colors text-sm ${location === '/mental-health' ? 'text-purple-600' : ''}`}>
              Mental Health
            </Link>
            <Link href="/disease-map" className={`text-gray-600 hover:text-purple-600 font-medium transition-colors text-sm ${location === '/disease-map' ? 'text-purple-600' : ''}`}>
              Disease Map
            </Link>
            <Link href="/insurance-hub" className={`text-gray-600 hover:text-purple-600 font-medium transition-colors text-sm ${location === '/insurance-hub' ? 'text-purple-600' : ''}`}>
              Insurance Hub
            </Link>
            <Link href="/admin/login" className={`text-gray-600 hover:text-purple-600 font-medium transition-colors text-sm ${location === '/admin/login' ? 'text-purple-600' : ''}`}>
              Admin Portal
            </Link>
          </div>

          {/* Right Side Actions - Clean Sehatify Style */}
          <div className="flex items-center space-x-6">
            {/* Auth Buttons / User Profile */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2" data-testid="button-profile">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden md:inline text-gray-700 font-medium">{user.name || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <UserCircle className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 flex items-center">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" className="text-purple-600 font-medium hover:bg-purple-50 text-sm" data-testid="button-login">
                    Login
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/doctors" className={`block px-3 py-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-md ${location === '/doctors' ? 'bg-purple-50 text-purple-600' : ''}`}>
                Talk to Doctor
              </Link>
              <Link href="/medicines" className={`block px-3 py-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-md ${location === '/medicines' ? 'bg-purple-50 text-purple-600' : ''}`}>
                Medicines
              </Link>
              <Link href="/vitals" className={`block px-3 py-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-md ${location === '/vitals' ? 'bg-purple-50 text-purple-600' : ''}`}>
                Book an Appointment
              </Link>
              <Link href="/lab-tests" className={`block px-3 py-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-md ${location === '/lab-tests' ? 'bg-purple-50 text-purple-600' : ''}`}>
                Lab Test & Diagnostic
              </Link>
              <Link href="/ai-doctor" className={`block px-3 py-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-md ${location === '/ai-doctor' ? 'bg-purple-50 text-purple-600' : ''}`}>
                AI Doctor
              </Link>
              <Link href="/mental-health" className={`block px-3 py-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-md ${location === '/mental-health' ? 'bg-purple-50 text-purple-600' : ''}`}>
                Mental Health
              </Link>
              <Link href="/disease-map" className={`block px-3 py-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-md ${location === '/disease-map' ? 'bg-purple-50 text-purple-600' : ''}`}>
                Disease Map
              </Link>
              <Link href="/insurance-hub" className={`block px-3 py-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-md ${location === '/insurance-hub' ? 'bg-purple-50 text-purple-600' : ''}`}>
                Insurance Hub
              </Link>
              <Link href="/admin/login" className={`block px-3 py-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-md ${location === '/admin/login' ? 'bg-purple-50 text-purple-600' : ''}`}>
                Admin Portal
              </Link>
              <Link href="/" className={`block px-3 py-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-md ${location === '/' ? 'bg-purple-50 text-purple-600' : ''}`}>
                About Us
              </Link>
              {!user && (
                <Link href="/login" className="block px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-md font-medium">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
