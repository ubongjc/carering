import Foundation
import Combine

@MainActor
class CircleListViewModel: ObservableObject {
    @Published var circles: [Circle] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let circleService = CircleService()
    private var cancellables = Set<AnyCancellable>()

    func loadCircles() async {
        isLoading = true
        errorMessage = nil

        do {
            let fetchedCircles = try await circleService.fetchCircles()
            circles = fetchedCircles
        } catch {
            errorMessage = error.localizedDescription
            print("Error loading circles: \(error)")
        }

        isLoading = false
    }

    func addCircle(_ circle: Circle) {
        circles.insert(circle, at: 0)
    }

    func removeCircle(_ circle: Circle) {
        circles.removeAll { $0.id == circle.id }
    }

    func updateCircle(_ circle: Circle) {
        if let index = circles.firstIndex(where: { $0.id == circle.id }) {
            circles[index] = circle
        }
    }
}
