import SwiftUI

struct CircleDetailView: View {
    let circle: Circle

    @State private var selectedTab = 0

    var body: some View {
        VStack(spacing: 0) {
            // Tab picker
            Picker("", selection: $selectedTab) {
                Text("Overview").tag(0)
                Text("Members").tag(1)
                Text("Plans").tag(2)
            }
            .pickerStyle(.segmented)
            .padding()

            // Content
            TabView(selection: $selectedTab) {
                CircleOverviewView(circle: circle)
                    .tag(0)

                CircleMembersView(circle: circle)
                    .tag(1)

                CirclePlansView(circle: circle)
                    .tag(2)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
        }
        .navigationTitle(circle.name)
        .navigationBarTitleDisplayMode(.large)
    }
}

struct CircleOverviewView: View {
    let circle: Circle

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Description
                if let description = circle.description {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Description")
                            .font(.headline)
                        Text(description)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                }

                // Quick stats
                HStack(spacing: 20) {
                    StatCard(
                        title: "Members",
                        value: "\(circle.members?.count ?? 0)",
                        icon: "person.2.fill",
                        color: .blue
                    )

                    StatCard(
                        title: "Care Plans",
                        value: "\(circle.carePlans?.count ?? 0)",
                        icon: "doc.text.fill",
                        color: .green
                    )
                }

                // Recent activity placeholder
                VStack(alignment: .leading, spacing: 12) {
                    Text("Recent Activity")
                        .font(.headline)

                    Text("Activity feed coming soon")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                }
            }
            .padding()
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Spacer()
            }

            Text(value)
                .font(.title)
                .fontWeight(.bold)

            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct CircleMembersView: View {
    let circle: Circle

    var body: some View {
        List {
            ForEach(circle.members ?? []) { member in
                HStack {
                    // Avatar
                    Circle()
                        .fill(Color.blue.opacity(0.2))
                        .frame(width: 40, height: 40)
                        .overlay(
                            Text(member.user?.name?.prefix(1).uppercased() ?? "?")
                                .foregroundColor(.blue)
                        )

                    VStack(alignment: .leading, spacing: 4) {
                        Text(member.user?.name ?? "Unknown")
                            .font(.headline)

                        Text(member.role.displayName)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Spacer()
                }
                .padding(.vertical, 4)
            }
        }
        .listStyle(.insetGrouped)
    }
}

struct CirclePlansView: View {
    let circle: Circle

    var body: some View {
        List {
            ForEach(circle.carePlans ?? []) { plan in
                VStack(alignment: .leading, spacing: 8) {
                    Text(plan.title)
                        .font(.headline)

                    if let description = plan.description {
                        Text(description)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .lineLimit(2)
                    }

                    HStack {
                        Label(plan.status.displayName, systemImage: "circle.fill")
                            .font(.caption)
                            .foregroundColor(plan.status == .active ? .green : .orange)
                    }
                }
                .padding(.vertical, 4)
            }
        }
        .listStyle(.insetGrouped)
    }
}

struct CircleDetailView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            CircleDetailView(circle: Circle(
                id: "1",
                name: "Family Care",
                description: "Care circle for family members",
                createdAt: Date(),
                updatedAt: Date(),
                creatorId: "user1"
            ))
        }
    }
}
