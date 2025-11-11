import Foundation
import AuthenticationServices
import Combine

// MARK: - Authentication Manager
class AuthenticationManager: NSObject, ObservableObject {
    static let shared = AuthenticationManager()

    @Published var isAuthenticated: Bool = false
    @Published var currentUser: User?
    @Published var authToken: String?

    private let keychainService = "com.carering.app"
    private let networkManager = NetworkManager.shared

    private override init() {
        super.init()
    }

    // MARK: - Check Authentication Status
    func checkAuthenticationStatus() async {
        // Check if we have a stored token
        if let token = retrieveTokenFromKeychain() {
            self.authToken = token
            networkManager.setAuthToken(token)

            // Validate token by fetching current user
            do {
                let user: User = try await networkManager.request(.currentUser)
                await MainActor.run {
                    self.currentUser = user
                    self.isAuthenticated = true
                }
            } catch {
                // Token is invalid, clear it
                await MainActor.run {
                    self.clearAuthentication()
                }
            }
        }
    }

    // MARK: - Sign In with Passkey
    func signInWithPasskey() async throws {
        // In a real implementation, this would use ASAuthorizationController
        // to authenticate with a passkey
        // For now, we'll simulate the flow

        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: "carering.app")

        // Create request for existing passkey
        let assertionRequest = provider.createCredentialAssertionRequest(challenge: Data())

        // Present authentication UI
        // Note: This is a simplified version. In production, you'd need to:
        // 1. Request challenge from server
        // 2. Present ASAuthorizationController
        // 3. Handle the response and exchange for auth token

        throw AuthError.notImplemented
    }

    // MARK: - Sign Up with Passkey
    func signUpWithPasskey(email: String, name: String) async throws {
        // In a real implementation, this would use ASAuthorizationController
        // to create a new passkey
        // For now, we'll simulate the flow

        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: "carering.app")

        // Create registration request
        let registrationRequest = provider.createCredentialRegistrationRequest(
            challenge: Data(),
            name: email,
            userID: Data()
        )

        // Present authentication UI
        // Note: This is a simplified version. In production, you'd need to:
        // 1. Request challenge from server
        // 2. Present ASAuthorizationController
        // 3. Handle the response and complete registration

        throw AuthError.notImplemented
    }

    // MARK: - Sign In with Token (for development/testing)
    func signInWithToken(_ token: String) async throws {
        self.authToken = token
        networkManager.setAuthToken(token)
        storeTokenInKeychain(token)

        // Fetch current user
        let user: User = try await networkManager.request(.currentUser)

        await MainActor.run {
            self.currentUser = user
            self.isAuthenticated = true
        }
    }

    // MARK: - Sign Out
    func signOut() {
        clearAuthentication()
    }

    // MARK: - Private Methods

    private func clearAuthentication() {
        authToken = nil
        currentUser = nil
        isAuthenticated = false
        networkManager.setAuthToken(nil)
        removeTokenFromKeychain()
    }

    // MARK: - Keychain Operations

    private func storeTokenInKeychain(_ token: String) {
        guard let tokenData = token.data(using: .utf8) else { return }

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: "authToken",
            kSecValueData as String: tokenData
        ]

        // Delete any existing item
        SecItemDelete(query as CFDictionary)

        // Add new item
        SecItemAdd(query as CFDictionary, nil)
    }

    private func retrieveTokenFromKeychain() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: "authToken",
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let tokenData = result as? Data,
              let token = String(data: tokenData, encoding: .utf8) else {
            return nil
        }

        return token
    }

    private func removeTokenFromKeychain() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: "authToken"
        ]

        SecItemDelete(query as CFDictionary)
    }
}

// MARK: - Auth Error
enum AuthError: LocalizedError {
    case notAuthenticated
    case invalidCredentials
    case notImplemented
    case passkeyNotAvailable
    case authorizationFailed

    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "Not authenticated"
        case .invalidCredentials:
            return "Invalid credentials"
        case .notImplemented:
            return "Feature not yet implemented"
        case .passkeyNotAvailable:
            return "Passkey authentication is not available on this device"
        case .authorizationFailed:
            return "Authorization failed"
        }
    }
}
