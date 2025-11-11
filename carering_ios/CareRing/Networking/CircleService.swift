import Foundation

// MARK: - Circle Service
class CircleService {
    private let networkManager: NetworkManager

    init(networkManager: NetworkManager = .shared) {
        self.networkManager = networkManager
    }

    // MARK: - Fetch Circles
    func fetchCircles() async throws -> [Circle] {
        try await networkManager.request(.circles)
    }

    // MARK: - Fetch Circle
    func fetchCircle(id: String) async throws -> Circle {
        try await networkManager.request(.circle(id: id))
    }

    // MARK: - Create Circle
    func createCircle(name: String, description: String?) async throws -> Circle {
        let request = CreateCircleRequest(name: name, description: description)
        return try await networkManager.request(.createCircle, method: .post, body: request)
    }

    // MARK: - Update Circle
    func updateCircle(id: String, name: String?, description: String?) async throws -> Circle {
        struct UpdateRequest: Codable {
            let name: String?
            let description: String?
        }

        let request = UpdateRequest(name: name, description: description)
        return try await networkManager.request(.updateCircle(id: id), method: .patch, body: request)
    }

    // MARK: - Delete Circle
    func deleteCircle(id: String) async throws {
        try await networkManager.request(.deleteCircle(id: id), method: .delete)
    }
}
