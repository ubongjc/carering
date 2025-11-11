import Foundation

// MARK: - Vital Reading
struct VitalReading: Codable, Identifiable, Equatable {
    let id: String
    let userId: String
    var type: VitalType
    var value: Double
    var unit: String
    var notes: String?
    let recordedAt: Date
    var source: String?
    var metadata: [String: AnyCodable]?

    var user: User?
}

// MARK: - Vital Type
enum VitalType: String, Codable, CaseIterable {
    case bloodPressureSystolic = "BLOOD_PRESSURE_SYSTOLIC"
    case bloodPressureDiastolic = "BLOOD_PRESSURE_DIASTOLIC"
    case heartRate = "HEART_RATE"
    case bloodGlucose = "BLOOD_GLUCOSE"
    case temperature = "TEMPERATURE"
    case weight = "WEIGHT"
    case oxygenSaturation = "OXYGEN_SATURATION"
    case respiratoryRate = "RESPIRATORY_RATE"

    var displayName: String {
        switch self {
        case .bloodPressureSystolic: return "Blood Pressure (Systolic)"
        case .bloodPressureDiastolic: return "Blood Pressure (Diastolic)"
        case .heartRate: return "Heart Rate"
        case .bloodGlucose: return "Blood Glucose"
        case .temperature: return "Temperature"
        case .weight: return "Weight"
        case .oxygenSaturation: return "Oxygen Saturation"
        case .respiratoryRate: return "Respiratory Rate"
        }
    }

    var icon: String {
        switch self {
        case .bloodPressureSystolic, .bloodPressureDiastolic: return "heart.circle"
        case .heartRate: return "waveform.path.ecg"
        case .bloodGlucose: return "drop.circle"
        case .temperature: return "thermometer"
        case .weight: return "scalemass"
        case .oxygenSaturation: return "lungs"
        case .respiratoryRate: return "wind"
        }
    }
}

// MARK: - AnyCodable (for flexible JSON encoding/decoding)
struct AnyCodable: Codable, Equatable {
    let value: Any

    init(_ value: Any) {
        self.value = value
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if let intValue = try? container.decode(Int.self) {
            value = intValue
        } else if let doubleValue = try? container.decode(Double.self) {
            value = doubleValue
        } else if let stringValue = try? container.decode(String.self) {
            value = stringValue
        } else if let boolValue = try? container.decode(Bool.self) {
            value = boolValue
        } else if let arrayValue = try? container.decode([AnyCodable].self) {
            value = arrayValue.map { $0.value }
        } else if let dictValue = try? container.decode([String: AnyCodable].self) {
            value = dictValue.mapValues { $0.value }
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Unsupported type")
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()

        switch value {
        case let intValue as Int:
            try container.encode(intValue)
        case let doubleValue as Double:
            try container.encode(doubleValue)
        case let stringValue as String:
            try container.encode(stringValue)
        case let boolValue as Bool:
            try container.encode(boolValue)
        case let arrayValue as [Any]:
            try container.encode(arrayValue.map { AnyCodable($0) })
        case let dictValue as [String: Any]:
            try container.encode(dictValue.mapValues { AnyCodable($0) })
        default:
            throw EncodingError.invalidValue(value, EncodingError.Context(codingPath: [], debugDescription: "Unsupported type"))
        }
    }

    static func == (lhs: AnyCodable, rhs: AnyCodable) -> Bool {
        // Basic equality check - expand as needed
        String(describing: lhs.value) == String(describing: rhs.value)
    }
}
