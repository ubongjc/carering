import Foundation

enum Configuration {
    // MARK: - API Configuration
    static var apiBaseURL: String {
        #if DEBUG
        return "http://localhost:3000"
        #else
        return "https://api.carering.app"
        #endif
    }

    static var wsBaseURL: String {
        #if DEBUG
        return "ws://localhost:3000"
        #else
        return "wss://api.carering.app"
        #endif
    }

    // MARK: - Feature Flags
    static let enableAITriage = false
    static let enableRespiteMatching = false

    // MARK: - App Information
    static var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
    }

    static var buildNumber: String {
        Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
    }

    // MARK: - Encryption
    static let encryptionSalt = "carering-secure-salt"

    // MARK: - HealthKit
    static let requestHealthKitAuthorization = true
}
