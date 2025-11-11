import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome back! Here's your care overview.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Medications"
            value="12"
            change="+2 this month"
            icon="💊"
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Upcoming Appointments"
            value="3"
            change="Next: Tomorrow"
            icon="📅"
            gradient="from-purple-500 to-pink-500"
          />
          <StatCard
            title="Pending Tasks"
            value="8"
            change="2 due today"
            icon="✓"
            gradient="from-orange-500 to-red-500"
          />
          <StatCard
            title="Care Circles"
            value="2"
            change="4 members"
            icon="👥"
            gradient="from-green-500 to-teal-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Schedule */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Today's Schedule
                </h2>
                <Link
                  href="/calendar"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                <ScheduleItem
                  time="9:00 AM"
                  title="Morning Medications"
                  type="medication"
                  color="blue"
                />
                <ScheduleItem
                  time="11:00 AM"
                  title="Physical Therapy"
                  type="appointment"
                  color="purple"
                />
                <ScheduleItem
                  time="2:00 PM"
                  title="Blood Pressure Check"
                  type="vital"
                  color="red"
                />
                <ScheduleItem
                  time="6:00 PM"
                  title="Evening Medications"
                  type="medication"
                  color="blue"
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                <ActivityItem
                  user="Sarah Johnson"
                  action="logged medication"
                  time="10 minutes ago"
                  icon="💊"
                />
                <ActivityItem
                  user="Dr. Smith"
                  action="added new appointment"
                  time="1 hour ago"
                  icon="📅"
                />
                <ActivityItem
                  user="Mom"
                  action="recorded blood pressure"
                  time="3 hours ago"
                  icon="❤️"
                />
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <QuickActionButton
                  href="/medications/log"
                  icon="💊"
                  label="Log Medication"
                  gradient="from-blue-500 to-cyan-500"
                />
                <QuickActionButton
                  href="/vitals/record"
                  icon="❤️"
                  label="Record Vitals"
                  gradient="from-red-500 to-pink-500"
                />
                <QuickActionButton
                  href="/appointments/new"
                  icon="📅"
                  label="Add Appointment"
                  gradient="from-purple-500 to-indigo-500"
                />
                <QuickActionButton
                  href="/messages"
                  icon="💬"
                  label="Send Message"
                  gradient="from-green-500 to-teal-500"
                />
              </div>
            </div>

            {/* Health Insights */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 shadow-lg text-white">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">🤖</span>
                <h2 className="text-xl font-bold">AI Health Insight</h2>
              </div>
              <p className="text-white/90 mb-4">
                Blood pressure readings are consistently within healthy range this week. Great
                job!
              </p>
              <Link
                href="/insights"
                className="inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                View All Insights
              </Link>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-6 shadow-lg text-white">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">💡</span>
                <h2 className="text-xl font-bold">Need Help?</h2>
              </div>
              <p className="text-white/90 mb-4">
                Our care coordination specialists are here 24/7.
              </p>
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
  gradient,
}: {
  title: string;
  value: string;
  change: string;
  icon: string;
  gradient: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-2xl mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</div>
      <div className="text-xs text-gray-500 dark:text-gray-500">{change}</div>
    </div>
  );
}

function ScheduleItem({
  time,
  title,
  type,
  color,
}: {
  time: string;
  title: string;
  type: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  };

  return (
    <div className={`flex items-center p-4 rounded-xl border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="text-sm font-bold mr-4 w-20">{time}</div>
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        <div className="text-xs opacity-75 capitalize">{type}</div>
      </div>
      <button className="px-3 py-1 bg-white dark:bg-gray-700 rounded-lg text-xs font-medium hover:shadow transition-shadow">
        Details
      </button>
    </div>
  );
}

function ActivityItem({
  user,
  action,
  time,
  icon,
}: {
  user: string;
  action: string;
  time: string;
  icon: string;
}) {
  return (
    <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
      <div className="text-2xl mr-3">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-900 dark:text-white">
          <span className="font-medium">{user}</span> {action}
        </p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}

function QuickActionButton({
  href,
  icon,
  label,
  gradient,
}: {
  href: string;
  icon: string;
  label: string;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center p-4 bg-gradient-to-r ${gradient} text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105`}
    >
      <span className="text-2xl mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
