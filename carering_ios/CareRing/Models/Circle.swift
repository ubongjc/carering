import Foundation

// MARK: - Circle
struct Circle: Codable, Identifiable, Equatable {
    let id: String
    var name: String
    var description: String?
    let createdAt: Date
    let updatedAt: Date
    let creatorId: String

    var creator: User?
    var members: [CircleMembership]?
    var carePlans: [CarePlan]?

    enum CodingKeys: String, CodingKey {
        case id, name, description, createdAt, updatedAt, creatorId, creator, members, carePlans
    }
}

// MARK: - Circle Membership
struct CircleMembership: Codable, Identifiable, Equatable {
    let id: String
    let circleId: String
    let userId: String
    let role: CircleRole
    let permissions: [String: Bool]?
    let joinedAt: Date

    var user: User?

    enum CodingKeys: String, CodingKey {
        case id, circleId, userId, role, permissions, joinedAt, user
    }
}

// MARK: - Circle Role
enum CircleRole: String, Codable, CaseIterable {
    case owner = "OWNER"
    case admin = "ADMIN"
    case caregiver = "CAREGIVER"
    case familyMember = "FAMILY_MEMBER"
    case viewer = "VIEWER"

    var displayName: String {
        switch self {
        case .owner: return "Owner"
        case .admin: return "Admin"
        case .caregiver: return "Caregiver"
        case .familyMember: return "Family Member"
        case .viewer: return "Viewer"
        }
    }

    var priority: Int {
        switch self {
        case .owner: return 5
        case .admin: return 4
        case .caregiver: return 3
        case .familyMember: return 2
        case .viewer: return 1
        }
    }
}

// MARK: - Create Circle Request
struct CreateCircleRequest: Codable {
    let name: String
    let description: String?
}
