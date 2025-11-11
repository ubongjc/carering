import SwiftUI

struct CircleListView: View {
    @StateObject private var viewModel = CircleListViewModel()
    @State private var showingCreateCircle = false

    var body: some View {
        NavigationView {
            ZStack {
                if viewModel.isLoading {
                    ProgressView()
                } else if viewModel.circles.isEmpty {
                    emptyStateView
                } else {
                    circlesList
                }
            }
            .navigationTitle("Care Circles")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingCreateCircle = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingCreateCircle) {
                CreateCircleView { circle in
                    viewModel.addCircle(circle)
                }
            }
            .refreshable {
                await viewModel.loadCircles()
            }
            .onAppear {
                Task {
                    await viewModel.loadCircles()
                }
            }
        }
    }

    private var circlesList: some View {
        List {
            ForEach(viewModel.circles) { circle in
                NavigationLink(destination: CircleDetailView(circle: circle)) {
                    CircleRow(circle: circle)
                }
            }
        }
        .listStyle(.insetGrouped)
    }

    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "person.3.fill")
                .font(.system(size: 60))
                .foregroundColor(.gray)

            Text("No Care Circles")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Create your first care circle to get started")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Button(action: { showingCreateCircle = true }) {
                Text("Create Circle")
                    .fontWeight(.semibold)
                    .frame(minWidth: 200)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
        }
    }
}

struct CircleRow: View {
    let circle: Circle

    var body: some View {
        HStack {
            // Circle icon
            ZStack {
                Circle()
                    .fill(Color.blue.opacity(0.2))
                    .frame(width: 50, height: 50)

                Image(systemName: "person.3.fill")
                    .foregroundColor(.blue)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(circle.name)
                    .font(.headline)

                if let description = circle.description {
                    Text(description)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }

                HStack(spacing: 12) {
                    Label("\(circle.members?.count ?? 0) members", systemImage: "person.2")
                    if let carePlansCount = circle.carePlans?.count {
                        Label("\(carePlansCount) plans", systemImage: "doc.text")
                    }
                }
                .font(.caption)
                .foregroundColor(.secondary)
            }

            Spacer()
        }
        .padding(.vertical, 4)
    }
}

struct CircleListView_Previews: PreviewProvider {
    static var previews: some View {
        CircleListView()
    }
}
