import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var showingSignOutAlert = false

    var body: some View {
        NavigationView {
            Form {
                // Profile Section
                Section(header: Text("Profile")) {
                    HStack {
                        Circle()
                            .fill(Color.blue.opacity(0.2))
                            .frame(width: 60, height: 60)
                            .overlay(
                                Image(systemName: "person.fill")
                                    .font(.title)
                                    .foregroundColor(.blue)
                            )

                        VStack(alignment: .leading, spacing: 4) {
                            Text(authManager.currentUser?.name ?? "User")
                                .font(.headline)

                            Text(authManager.currentUser?.email ?? "")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        .padding(.leading, 8)
                    }
                    .padding(.vertical, 8)

                    NavigationLink(destination: Text("Edit Profile (Coming Soon)")) {
                        Label("Edit Profile", systemImage: "pencil")
                    }
                }

                // Notifications Section
                Section(header: Text("Notifications")) {
                    NavigationLink(destination: Text("Notification Settings (Coming Soon)")) {
                        Label("Notifications", systemImage: "bell")
                    }
                }

                // Privacy & Security Section
                Section(header: Text("Privacy & Security")) {
                    NavigationLink(destination: Text("Privacy Settings (Coming Soon)")) {
                        Label("Privacy", systemImage: "lock.shield")
                    }

                    NavigationLink(destination: Text("Passkey Management (Coming Soon)")) {
                        Label("Passkeys", systemImage: "key")
                    }
                }

                // Support Section
                Section(header: Text("Support")) {
                    NavigationLink(destination: Text("Help Center (Coming Soon)")) {
                        Label("Help Center", systemImage: "questionmark.circle")
                    }

                    NavigationLink(destination: Text("Contact Support (Coming Soon)")) {
                        Label("Contact Support", systemImage: "envelope")
                    }

                    NavigationLink(destination: Text("About (Coming Soon)")) {
                        Label("About", systemImage: "info.circle")
                    }
                }

                // About Section
                Section(header: Text("About")) {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text(Configuration.appVersion)
                            .foregroundColor(.secondary)
                    }

                    HStack {
                        Text("Build")
                        Spacer()
                        Text(Configuration.buildNumber)
                            .foregroundColor(.secondary)
                    }
                }

                // Sign Out Section
                Section {
                    Button(action: { showingSignOutAlert = true }) {
                        HStack {
                            Spacer()
                            Label("Sign Out", systemImage: "arrow.right.square")
                                .foregroundColor(.red)
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Settings")
            .alert("Sign Out", isPresented: $showingSignOutAlert) {
                Button("Cancel", role: .cancel) {}
                Button("Sign Out", role: .destructive) {
                    authManager.signOut()
                }
            } message: {
                Text("Are you sure you want to sign out?")
            }
        }
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
            .environmentObject(AuthenticationManager.shared)
    }
}
