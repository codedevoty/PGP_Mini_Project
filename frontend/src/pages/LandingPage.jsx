import { Link } from 'react-router-dom';
import { QrCode, ChefHat, Zap, Smartphone, ShieldCheck, BarChart3, ArrowRight, Star, Utensils, Clock, CreditCard } from 'lucide-react';

export default function LandingPage() {
  const features = [
    { icon: <QrCode className="w-8 h-8" />, title: 'QR Code Menus', desc: 'Generate unique QR codes for each table. Customers scan and browse your menu instantly.' },
    { icon: <Utensils className="w-8 h-8" />, title: 'Digital Menu Builder', desc: 'Create beautiful menus with categories, dishes, images, tags and customizations.' },
    { icon: <Zap className="w-8 h-8" />, title: 'Live Ordering', desc: 'Customers order directly from their phone. Orders appear on your dashboard in real-time.' },
    { icon: <Clock className="w-8 h-8" />, title: 'Order Tracking', desc: 'Track order status from pending to served. Keep your kitchen and customers in sync.' },
    { icon: <CreditCard className="w-8 h-8" />, title: 'Easy Billing', desc: 'Auto-generated bills with UPI, Card, and Cash payment options. Session-based billing.' },
    { icon: <BarChart3 className="w-8 h-8" />, title: 'Dashboard Analytics', desc: 'Monitor orders, revenue, active tables, and session history all in one place.' },
  ];

  const steps = [
    { num: '01', title: 'Sign Up & Register', desc: 'Create your account and register your restaurant details.' },
    { num: '02', title: 'Build Your Menu', desc: 'Add categories, dishes with images, pricing and special tags.' },
    { num: '03', title: 'Generate QR Codes', desc: 'Enter table count and print unique QR codes for each table.' },
    { num: '04', title: 'Go Live!', desc: 'Customers scan, order, and you manage everything from your dashboard.' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold font-display">SmartQR</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors font-medium">Login</Link>
            <Link to="/signup" className="btn-primary text-sm !py-2 !px-5">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-float animate-delay-300"></div>
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-primary-300 font-medium">Smart Restaurant Management</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight mb-6">
            <span className="text-white">Transform Your</span><br />
            <span className="gradient-text">Restaurant Experience</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            QR-based digital menus, live ordering, real-time order tracking, and seamless billing — all in one powerful platform.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/signup" className="btn-primary text-lg !py-4 !px-8 flex items-center gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="btn-secondary text-lg !py-4 !px-8">
              See Features
            </a>
          </div>
          {/* Hero Image / Demo Preview */}
          <div className="mt-16 relative">
            <div className="glass-card p-2 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl p-8 text-center">
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass-card p-4">
                    <div className="text-3xl font-bold text-primary-400">24</div>
                    <div className="text-sm text-gray-400 mt-1">Active Orders</div>
                  </div>
                  <div className="glass-card p-4">
                    <div className="text-3xl font-bold text-emerald-400">₹18.5K</div>
                    <div className="text-sm text-gray-400 mt-1">Today's Revenue</div>
                  </div>
                  <div className="glass-card p-4">
                    <div className="text-3xl font-bold text-accent-400">12</div>
                    <div className="text-sm text-gray-400 mt-1">Tables Active</div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {['Paneer Tikka ×2 — Table 5', 'Butter Chicken ×1 — Table 3', 'Dal Makhani ×3 — Table 8', 'Naan ×4 — Table 1'].map((item, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3 text-left text-sm flex items-center justify-between">
                      <span>{item}</span>
                      <span className={`badge ${i < 2 ? 'badge-yellow' : 'badge-green'}`}>{i < 2 ? 'Preparing' : 'Served'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-primary-500/20 blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Everything You Need</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">Powerful features to digitize your restaurant operations from menu to payment.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card p-6 hover:bg-white/10 transition-all duration-300 group animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center text-primary-400 mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-dark-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Get started in 4 simple steps</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="relative text-center group">
                <div className="text-6xl font-bold font-display text-primary-500/20 group-hover:text-primary-500/40 transition-colors">{s.num}</div>
                <h3 className="text-lg font-bold mt-2 mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
                {i < 3 && <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 w-12 border-t-2 border-dashed border-primary-500/30"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Loved by Restaurant Owners</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Rajesh Kumar', role: 'Owner, Spice Garden', text: 'Our order efficiency increased by 40%. Customers love the QR ordering experience!' },
              { name: 'Priya Sharma', role: 'Manager, The Food Hub', text: 'No more printed menus! Digital menu updates are instant and the live orders feature is a game-changer.' },
              { name: 'Amit Patel', role: 'Owner, Taste of India', text: 'The billing system is so smooth. Session management makes table turnover much faster.' },
            ].map((t, i) => (
              <div key={i} className="glass-card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-accent-400 fill-accent-400" />)}
                </div>
                <p className="text-gray-300 text-sm mb-4 italic">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center glass-card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10"></div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Ready to Digitize Your Restaurant?</h2>
            <p className="text-gray-400 mb-8">Join hundreds of restaurants already using SmartQR to enhance their customer experience.</p>
            <Link to="/signup" className="btn-primary text-lg !py-4 !px-10 inline-flex items-center gap-2">
              Get Started Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold font-display">SmartQR Restaurant</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 SmartQR Restaurant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
