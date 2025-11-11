import SwiftUI

@main
struct CareRingApp: App {
    @StateObject private var authManager = AuthenticationManager.shared
    @StateObject private var networkManager = NetworkManager.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(networkManager)
                .onAppear {
                    configureApp()
                }
        }
    }

    private func configureApp() {
        // Configure network manager
        networkManager.configure(baseURL: Configuration.apiBaseURL)

        // Check authentication status
        Task {
            await authManager.checkAuthenticationStatus()
        }
    }
}
