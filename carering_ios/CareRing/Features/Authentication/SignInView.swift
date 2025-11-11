import SwiftUI
import AuthenticationServices

struct SignInView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showDevelopmentLogin = false

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [Color.blue.opacity(0.6), Color.purple.opacity(0.6)]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 30) {
                Spacer()

                // Logo and title
                VStack(spacing: 16) {
                    Image(systemName: "heart.circle.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.white)

                    Text("CareRing")
                        .font(.system(size: 48, weight: .bold))
                        .foregroundColor(.white)

                    Text("Your care circle, always connected")
                        .font(.headline)
                        .foregroundColor(.white.opacity(0.9))
                }

                Spacer()

                // Sign in options
                VStack(spacing: 16) {
                    // Passkey Sign In
                    Button(action: signInWithPasskey) {
                        HStack {
                            Image(systemName: "person.badge.key.fill")
                            Text("Sign in with Passkey")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.white)
                        .foregroundColor(.blue)
                        .cornerRadius(12)
                    }
                    .disabled(isLoading)

                    // Development login (for testing)
                    if showDevelopmentLogin {
                        Button(action: developmentLogin) {
                            HStack {
                                Image(systemName: "wrench.and.screwdriver")
                                Text("Development Login")
                                    .fontWeight(.semibold)
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.white.opacity(0.3))
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                        .disabled(isLoading)
                    }

                    // Error message
                    if let errorMessage = errorMessage {
                        Text(errorMessage)
                            .font(.caption)
                            .foregroundColor(.red)
                            .padding()
                            .background(Color.white.opacity(0.9))
                            .cornerRadius(8)
                    }
                }
                .padding(.horizontal, 40)

                Spacer()

                // Footer
                VStack(spacing: 8) {
                    Text("By continuing, you agree to our")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))

                    HStack(spacing: 4) {
                        Button("Terms of Service") {}
                        Text("and")
                        Button("Privacy Policy") {}
                    }
                    .font(.caption)
                    .foregroundColor(.white)
                }
                .padding(.bottom, 40)
            }

            // Loading overlay
            if isLoading {
                Color.black.opacity(0.3)
                    .ignoresSafeArea()

                ProgressView()
                    .scaleEffect(1.5)
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
            }
        }
        .onAppear {
            #if DEBUG
            showDevelopmentLogin = true
            #endif
        }
    }

    // MARK: - Actions

    private func signInWithPasskey() {
        isLoading = true
        errorMessage = nil

        Task {
            do {
                try await authManager.signInWithPasskey()
                await MainActor.run {
                    isLoading = false
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = error.localizedDescription
                }
            }
        }
    }

    private func developmentLogin() {
        isLoading = true
        errorMessage = nil

        Task {
            do {
                // In development, we can use a test token or skip auth
                // For now, we'll just mark as authenticated
                // In a real app, you'd get this token from your backend

                let testToken = "dev-token-\(UUID().uuidString)"
                try await authManager.signInWithToken(testToken)

                await MainActor.run {
                    isLoading = false
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = "Development login not available. Please implement token exchange."
                }
            }
        }
    }
}

struct SignInView_Previews: PreviewProvider {
    static var previews: some View {
        SignInView()
            .environmentObject(AuthenticationManager.shared)
    }
}
