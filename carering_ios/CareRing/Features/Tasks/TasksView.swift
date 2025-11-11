import SwiftUI

struct TasksView: View {
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Placeholder content
                    Image(systemName: "checklist")
                        .font(.system(size: 60))
                        .foregroundColor(.blue)

                    Text("Task Management")
                        .font(.title2)
                        .fontWeight(.semibold)

                    Text("Manage care tasks, medications, and appointments")
                        .font(.body)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)

                    Text("Coming soon")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                }
                .padding()
            }
            .navigationTitle("Tasks")
        }
    }
}

struct TasksView_Previews: PreviewProvider {
    static var previews: some View {
        TasksView()
    }
}
