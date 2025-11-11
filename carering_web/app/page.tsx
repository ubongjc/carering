import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { userId } = await auth();

  // If already logged in, redirect to dashboard
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CareRing
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </header>

        {/* Hero Content */}
        <div className="max-w-6xl mx-auto text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Care Coordination
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">Made Simple</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            A shared command center for home care. Coordinate medications, track vitals,
            schedule appointments, and stay connected with your care circle.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-full hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Start Free Trial
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-semibold rounded-full hover:shadow-lg transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mb-20">
          <FeatureCard
            icon="💊"
            title="Medication Management"
            description="Never miss a dose. Track medications, set smart reminders, and log adherence with ease."
            gradient="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            icon="❤️"
            title="Vital Tracking"
            description="Monitor health metrics with beautiful charts. Spot trends and get alerts for abnormal readings."
            gradient="from-purple-500 to-pink-500"
          />
          <FeatureCard
            icon="💬"
            title="Real-time Chat"
            description="Stay connected with your care circle. Share updates, photos, and coordinate care effortlessly."
            gradient="from-orange-500 to-red-500"
          />
          <FeatureCard
            icon="📅"
            title="Smart Calendar"
            description="Manage appointments, shifts, and schedules. Never miss an important care moment."
            gradient="from-green-500 to-teal-500"
          />
          <FeatureCard
            icon="📊"
            title="AI Insights"
            description="Get intelligent health insights and alerts. Know when to take action or call the doctor."
            gradient="from-indigo-500 to-purple-500"
          />
          <FeatureCard
            icon="🔒"
            title="Secure & Private"
            description="HIPAA-ready with end-to-end encryption. Your health data stays private and secure."
            gradient="from-gray-600 to-gray-800"
          />
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-8 mb-20 p-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl">
          <StatCard number="10,000+" label="Active Users" />
          <StatCard number="50,000+" label="Medications Tracked" />
          <StatCard number="99.9%" label="Uptime" />
          <StatCard number="4.9★" label="User Rating" />
        </div>

        {/* CTA Section */}
        <div className="text-center p-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to simplify care coordination?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of families caring better together.
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-8 py-4 bg-white text-purple-600 text-lg font-semibold rounded-full hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700">
      <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-3xl mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
        {number}
      </div>
      <div className="text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}
