import Foundation

// MARK: - User
struct User: Codable, Identifiable, Equatable {
    let id: String
    var email: String
    var name: String?
    var avatarUrl: String?
    let createdAt: Date?
    let updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id, email, name, avatarUrl, createdAt, updatedAt
    }
}
