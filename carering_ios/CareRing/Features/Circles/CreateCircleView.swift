import SwiftUI

struct CreateCircleView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel = CreateCircleViewModel()

    let onCircleCreated: (Circle) -> Void

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Circle Information")) {
                    TextField("Name", text: $viewModel.name)
                    TextField("Description (optional)", text: $viewModel.description, axis: .vertical)
                        .lineLimit(3...6)
                }

                if let errorMessage = viewModel.errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }
            }
            .navigationTitle("New Circle")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        Task {
                            await createCircle()
                        }
                    }
                    .disabled(viewModel.name.isEmpty || viewModel.isLoading)
                }
            }
            .disabled(viewModel.isLoading)
            .overlay {
                if viewModel.isLoading {
                    Color.black.opacity(0.2)
                        .ignoresSafeArea()

                    ProgressView()
                }
            }
        }
    }

    private func createCircle() async {
        if await viewModel.createCircle() {
            if let circle = viewModel.createdCircle {
                onCircleCreated(circle)
            }
            dismiss()
        }
    }
}

@MainActor
class CreateCircleViewModel: ObservableObject {
    @Published var name = ""
    @Published var description = ""
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var createdCircle: Circle?

    private let circleService = CircleService()

    func createCircle() async -> Bool {
        isLoading = true
        errorMessage = nil

        do {
            let circle = try await circleService.createCircle(
                name: name,
                description: description.isEmpty ? nil : description
            )
            createdCircle = circle
            isLoading = false
            return true
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return false
        }
    }
}

struct CreateCircleView_Previews: PreviewProvider {
    static var previews: some View {
        CreateCircleView { _ in }
    }
}
