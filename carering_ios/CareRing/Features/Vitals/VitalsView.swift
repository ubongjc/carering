import SwiftUI

struct VitalsView: View {
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Placeholder content
                    Image(systemName: "heart.text.square.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.red)

                    Text("Vitals Tracking")
                        .font(.title2)
                        .fontWeight(.semibold)

                    Text("Track blood pressure, heart rate, glucose, and more")
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
            .navigationTitle("Vitals")
        }
    }
}

struct VitalsView_Previews: PreviewProvider {
    static var previews: some View {
        VitalsView()
    }
}
