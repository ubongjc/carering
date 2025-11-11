import Foundation
import CryptoKit

// MARK: - Encryption Manager
class EncryptionManager {
    static let shared = EncryptionManager()

    private init() {}

    // MARK: - Encrypt Data
    /// Encrypts data using AES-GCM with a derived key
    func encrypt(data: Data, password: String) throws -> EncryptedData {
        // Derive key from password
        let salt = generateSalt()
        let key = try deriveKey(from: password, salt: salt)

        // Generate nonce
        let nonce = AES.GCM.Nonce()

        // Encrypt data
        let sealedBox = try AES.GCM.seal(data, using: key, nonce: nonce)

        guard let ciphertext = sealedBox.ciphertext.base64EncodedString() as String?,
              let tag = sealedBox.tag.base64EncodedString() as String? else {
            throw EncryptionError.encryptionFailed
        }

        return EncryptedData(
            ciphertext: ciphertext,
            nonce: nonce.withUnsafeBytes { Data($0) }.base64EncodedString(),
            salt: salt.base64EncodedString(),
            tag: tag
        )
    }

    // MARK: - Decrypt Data
    /// Decrypts data using AES-GCM with a derived key
    func decrypt(encryptedData: EncryptedData, password: String) throws -> Data {
        // Decode components
        guard let saltData = Data(base64Encoded: encryptedData.salt),
              let nonceData = Data(base64Encoded: encryptedData.nonce),
              let ciphertextData = Data(base64Encoded: encryptedData.ciphertext),
              let tagData = Data(base64Encoded: encryptedData.tag) else {
            throw EncryptionError.invalidEncryptedData
        }

        // Derive key from password
        let key = try deriveKey(from: password, salt: saltData)

        // Create nonce
        let nonce = try AES.GCM.Nonce(data: nonceData)

        // Create sealed box
        let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertextData, tag: tagData)

        // Decrypt data
        let decryptedData = try AES.GCM.open(sealedBox, using: key)

        return decryptedData
    }

    // MARK: - Encrypt File
    /// Encrypts file data before upload
    func encryptFile(fileURL: URL, password: String) throws -> EncryptedData {
        let fileData = try Data(contentsOf: fileURL)
        return try encrypt(data: fileData, password: password)
    }

    // MARK: - Decrypt File
    /// Decrypts file data after download
    func decryptFile(encryptedData: EncryptedData, password: String, outputURL: URL) throws {
        let decryptedData = try decrypt(encryptedData: encryptedData, password: password)
        try decryptedData.write(to: outputURL)
    }

    // MARK: - Hash Password
    /// Creates a SHA-256 hash of a password for verification
    func hashPassword(_ password: String) -> String {
        let inputData = Data(password.utf8)
        let hashed = SHA256.hash(data: inputData)
        return hashed.compactMap { String(format: "%02x", $0) }.joined()
    }

    // MARK: - Private Methods

    private func deriveKey(from password: String, salt: Data) throws -> SymmetricKey {
        guard let passwordData = password.data(using: .utf8) else {
            throw EncryptionError.invalidPassword
        }

        // Use PBKDF2 for key derivation
        // Note: In production, consider using a higher iteration count (100,000+)
        let iterations = 100_000
        let keyLength = 32 // 256 bits

        var derivedKeyData = Data(repeating: 0, count: keyLength)

        let derivationStatus = derivedKeyData.withUnsafeMutableBytes { derivedKeyBytes in
            salt.withUnsafeBytes { saltBytes in
                passwordData.withUnsafeBytes { passwordBytes in
                    CCKeyDerivationPBKDF(
                        CCPBKDFAlgorithm(kCCPBKDF2),
                        passwordBytes.baseAddress, passwordData.count,
                        saltBytes.baseAddress, salt.count,
                        CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA256),
                        UInt32(iterations),
                        derivedKeyBytes.baseAddress, keyLength
                    )
                }
            }
        }

        guard derivationStatus == kCCSuccess else {
            throw EncryptionError.keyDerivationFailed
        }

        return SymmetricKey(data: derivedKeyData)
    }

    private func generateSalt() -> Data {
        var salt = Data(count: 32)
        _ = salt.withUnsafeMutableBytes { bytes in
            SecRandomCopyBytes(kSecRandomDefault, 32, bytes.baseAddress!)
        }
        return salt
    }
}

// MARK: - Encrypted Data
struct EncryptedData: Codable {
    let ciphertext: String
    let nonce: String
    let salt: String
    let tag: String
}

// MARK: - Encryption Error
enum EncryptionError: LocalizedError {
    case encryptionFailed
    case decryptionFailed
    case invalidEncryptedData
    case invalidPassword
    case keyDerivationFailed

    var errorDescription: String? {
        switch self {
        case .encryptionFailed:
            return "Failed to encrypt data"
        case .decryptionFailed:
            return "Failed to decrypt data"
        case .invalidEncryptedData:
            return "Invalid encrypted data format"
        case .invalidPassword:
            return "Invalid password"
        case .keyDerivationFailed:
            return "Failed to derive encryption key"
        }
    }
}

// Import CommonCrypto for PBKDF2
import CommonCrypto
