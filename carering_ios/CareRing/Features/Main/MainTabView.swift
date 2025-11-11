import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            CircleListView()
                .tabItem {
                    Label("Circles", systemImage: "person.3.fill")
                }
                .tag(0)

            VitalsView()
                .tabItem {
                    Label("Vitals", systemImage: "heart.text.square.fill")
                }
                .tag(1)

            TasksView()
                .tabItem {
                    Label("Tasks", systemImage: "checklist")
                }
                .tag(2)

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
                .tag(3)
        }
    }
}

struct MainTabView_Previews: PreviewProvider {
    static var previews: some View {
        MainTabView()
            .environmentObject(AuthenticationManager.shared)
            .environmentObject(NetworkManager.shared)
    }
}
