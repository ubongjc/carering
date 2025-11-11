import Foundation

// MARK: - Care Plan
struct CarePlan: Codable, Identifiable, Equatable {
    let id: String
    let circleId: String
    var title: String
    var description: String?
    var goals: [Goal]
    var status: PlanStatus
    let createdAt: Date
    let updatedAt: Date

    var medications: [Medication]?
    var tasks: [Task]?
}

// MARK: - Goal
struct Goal: Codable, Identifiable, Equatable {
    var id: String
    var title: String
    var description: String?
    var targetDate: Date?
}

// MARK: - Plan Status
enum PlanStatus: String, Codable, CaseIterable {
    case draft = "DRAFT"
    case active = "ACTIVE"
    case paused = "PAUSED"
    case completed = "COMPLETED"
    case archived = "ARCHIVED"

    var displayName: String {
        rawValue.capitalized
    }
}

// MARK: - Medication
struct Medication: Codable, Identifiable, Equatable {
    let id: String
    let carePlanId: String
    var name: String
    var dosage: String
    var frequency: String
    var instructions: String?
    let startDate: Date
    var endDate: Date?
    var isActive: Bool
    let createdAt: Date
    let updatedAt: Date

    var logs: [MedicationLog]?
}

// MARK: - Medication Log
struct MedicationLog: Codable, Identifiable, Equatable {
    let id: String
    let medicationId: String
    let takenAt: Date
    var takenBy: String?
    var notes: String?
    var status: MedLogStatus
    let createdAt: Date
}

// MARK: - Med Log Status
enum MedLogStatus: String, Codable, CaseIterable {
    case taken = "TAKEN"
    case skipped = "SKIPPED"
    case delayed = "DELAYED"
    case partial = "PARTIAL"

    var displayName: String {
        rawValue.capitalized
    }
}

// MARK: - Task
struct Task: Codable, Identifiable, Equatable {
    let id: String
    var carePlanId: String?
    var assigneeId: String?
    var title: String
    var description: String?
    var dueAt: Date?
    var completedAt: Date?
    var priority: TaskPriority
    var status: TaskStatus
    let createdAt: Date
    let updatedAt: Date

    var assignee: User?
}

// MARK: - Task Priority
enum TaskPriority: String, Codable, CaseIterable {
    case low = "LOW"
    case medium = "MEDIUM"
    case high = "HIGH"
    case urgent = "URGENT"

    var displayName: String {
        rawValue.capitalized
    }
}

// MARK: - Task Status
enum TaskStatus: String, Codable, CaseIterable {
    case todo = "TODO"
    case inProgress = "IN_PROGRESS"
    case completed = "COMPLETED"
    case cancelled = "CANCELLED"

    var displayName: String {
        switch self {
        case .todo: return "To Do"
        case .inProgress: return "In Progress"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        }
    }
}
