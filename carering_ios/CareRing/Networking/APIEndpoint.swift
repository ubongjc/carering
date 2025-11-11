import Foundation

// MARK: - API Endpoint
enum APIEndpoint {
    // Health
    case health

    // Circles
    case circles
    case circle(id: String)
    case createCircle
    case updateCircle(id: String)
    case deleteCircle(id: String)

    // Care Plans
    case carePlans(circleId: String)
    case carePlan(id: String)
    case createCarePlan
    case updateCarePlan(id: String)

    // Medications
    case medications(carePlanId: String)
    case medication(id: String)
    case logMedication

    // Vital Readings
    case vitalReadings(userId: String)
    case vitalReading(id: String)
    case createVitalReading

    // Tasks
    case tasks(circleId: String)
    case task(id: String)
    case createTask
    case updateTask(id: String)

    // User
    case currentUser
    case updateProfile

    var path: String {
        switch self {
        case .health:
            return "/api/health"

        case .circles:
            return "/api/circle"
        case .circle(let id):
            return "/api/circle/\(id)"
        case .createCircle:
            return "/api/circle"
        case .updateCircle(let id):
            return "/api/circle/\(id)"
        case .deleteCircle(let id):
            return "/api/circle/\(id)"

        case .carePlans(let circleId):
            return "/api/circle/\(circleId)/plan"
        case .carePlan(let id):
            return "/api/plan/\(id)"
        case .createCarePlan:
            return "/api/plan"
        case .updateCarePlan(let id):
            return "/api/plan/\(id)"

        case .medications(let carePlanId):
            return "/api/plan/\(carePlanId)/medication"
        case .medication(let id):
            return "/api/medication/\(id)"
        case .logMedication:
            return "/api/medication/log"

        case .vitalReadings(let userId):
            return "/api/vital?userId=\(userId)"
        case .vitalReading(let id):
            return "/api/vital/\(id)"
        case .createVitalReading:
            return "/api/vital"

        case .tasks(let circleId):
            return "/api/circle/\(circleId)/task"
        case .task(let id):
            return "/api/task/\(id)"
        case .createTask:
            return "/api/task"
        case .updateTask(let id):
            return "/api/task/\(id)"

        case .currentUser:
            return "/api/user/me"
        case .updateProfile:
            return "/api/user/profile"
        }
    }
}
